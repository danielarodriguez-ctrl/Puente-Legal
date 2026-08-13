#!/usr/bin/env node
/**
 * Importa la lista de abogados que ya tienes en un CSV.
 * Úsalo una sola vez, al arrancar, para cargar las inscripciones
 * que llegaron antes de conectar el webhook de Tally.
 *
 *   node importar-csv.mjs abogados.csv
 *
 * El CSV debe tener encabezados. Se reconocen (sin importar mayúsculas
 * ni tildes): nombre, email/correo, telefono/celular, tarjeta,
 * ciudad, areas, cupo/max_casos.
 *
 * La columna `areas` puede traer los nombres tal como salen de Tally,
 * separados por coma o punto y coma. Se traducen con el mismo mapeo
 * que usa el webhook.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const MAPA_AREAS = {
  vivienda: ["vivienda", "arrend", "arriendo", "inmobiliar", "propiedad horizontal", "urban"],
  seguros: ["seguro", "poliza", "asegurad"],
  ayudas_estado: ["administrativ", "tutela", "peticion", "publico", "constitucional", "humanitari", "estado"],
  documentos: ["registro civil", "notarial", "notaria", "identificacion", "documento"],
  fallecimiento: ["sucesi", "herencia", "mortuori", "defuncion"],
  desaparicion: ["penal", "desaparic", "denuncia", "victimas"],
  salud: ["salud", "eps", "pensi", "seguridad social", "arl", "riesgos laborales"],
  laboral: ["laboral", "trabajo", "empleo"],
  deudas: ["financier", "deuda", "credito", "insolvencia", "bancari", "comercial", "hipotec"],
  familia: ["familia", "custodia", "alimentos", "menor", "infancia", "ninez"],
  otro: ["general", "otro", "cualquier", "orientacion"],
};

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function mapearAreas(texto) {
  const partes = String(texto ?? "").split(/[;,|]/);
  const encontradas = new Set();
  for (const parte of partes) {
    const n = norm(parte);
    if (!n) continue;
    if (MAPA_AREAS[n]) {
      encontradas.add(n);
      continue;
    }
    for (const [id, palabras] of Object.entries(MAPA_AREAS)) {
      if (palabras.some((p) => n.includes(p))) encontradas.add(id);
    }
    if (n.includes("civil")) {
      encontradas.add("vivienda");
      encontradas.add("deudas");
    }
  }
  return encontradas.size ? [...encontradas] : ["otro"];
}

/** Parser de CSV que respeta comillas y saltos de línea dentro de celdas. */
function parsearCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = "";
  let enComillas = false;

  const limpio = texto.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

  for (let i = 0; i < limpio.length; i++) {
    const ch = limpio[i];
    if (enComillas) {
      if (ch === '"') {
        if (limpio[i + 1] === '"') {
          celda += '"';
          i++;
        } else enComillas = false;
      } else celda += ch;
    } else if (ch === '"') enComillas = true;
    else if (ch === ",") {
      fila.push(celda);
      celda = "";
    } else if (ch === "\n") {
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += ch;
  }
  if (celda || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
}

function columna(encabezados, alias) {
  for (const a of alias) {
    const i = encabezados.findIndex((h) => norm(h).includes(norm(a)));
    if (i !== -1) return i;
  }
  return -1;
}

async function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error("Uso: node importar-csv.mjs <archivo.csv>");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.");
    process.exit(1);
  }

  const filas = parsearCSV(readFileSync(ruta, "utf8"));
  const [encabezados, ...datos] = filas;

  const idx = {
    nombre: columna(encabezados, ["nombre"]),
    email: columna(encabezados, ["email", "correo"]),
    telefono: columna(encabezados, ["telefono", "celular", "whatsapp"]),
    tarjeta: columna(encabezados, ["tarjeta", "matricula"]),
    ciudad: columna(encabezados, ["ciudad", "municipio", "ubicacion"]),
    areas: columna(encabezados, ["area", "especialidad", "rama"]),
    cupo: columna(encabezados, ["cupo", "max_casos", "casos", "capacidad"]),
  };

  if (idx.email === -1) {
    console.error("El CSV no tiene una columna de correo. Encabezados:", encabezados);
    process.exit(1);
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;

  for (const fila of datos) {
    const email = String(fila[idx.email] ?? "").trim().toLowerCase();
    if (!email.includes("@")) {
      omitidos++;
      continue;
    }

    const cupo = parseInt(String(fila[idx.cupo] ?? "").replace(/\D/g, ""), 10);

    const registro = {
      nombre: String(fila[idx.nombre] ?? "").trim() || "Sin nombre",
      email,
      telefono: idx.telefono > -1 ? String(fila[idx.telefono] ?? "").trim() || null : null,
      tarjeta_profesional:
        idx.tarjeta > -1 ? String(fila[idx.tarjeta] ?? "").trim() || null : null,
      ciudad: idx.ciudad > -1 ? String(fila[idx.ciudad] ?? "").trim() || null : null,
      areas: mapearAreas(idx.areas > -1 ? fila[idx.areas] : ""),
      max_casos: Number.isFinite(cupo) && cupo > 0 ? Math.min(cupo, 20) : 3,
      activo: true,
      origen: "csv",
    };

    const { data: existente } = await db
      .from("abogados")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existente) {
      await db.from("abogados").update(registro).eq("id", existente.id);
      actualizados++;
    } else {
      const { error } = await db.from("abogados").insert(registro);
      if (error) {
        console.error(`  ✗ ${email}: ${error.message}`);
        omitidos++;
      } else {
        creados++;
      }
    }
  }

  console.log(`\nListo. Creados: ${creados} · Actualizados: ${actualizados} · Omitidos: ${omitidos}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
