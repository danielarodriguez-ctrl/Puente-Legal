// Traduce una respuesta de Tally a un registro de la tabla `abogados`.
// El mapeo es por palabras clave en la etiqueta de la pregunta, así que
// funciona aunque tu formulario tenga los títulos redactados distinto.
// Si cambias el formulario, ajusta las listas de CLAVES.

import { AREAS } from "@/areas";

type TallyField = {
  key: string;
  label: string;
  type: string;
  value: unknown;
  options?: { id: string; text: string }[];
};

const CLAVES = {
  nombre: ["nombre completo", "nombre y apellido", "nombre"],
  email: ["correo", "email", "e-mail"],
  telefono: ["celular", "teléfono", "telefono", "whatsapp", "contacto"],
  tarjeta: ["tarjeta profesional", "tarjeta", "t.p", "matrícula"],
  ciudad: ["ciudad", "municipio", "ubicación", "dónde", "donde"],
  areas: ["área", "areas", "áreas", "especialidad", "rama", "materia"],
  cupo: ["cuántos casos", "cuantos casos", "cupo", "capacidad", "disponibilidad"],
};

// ============================================================
// CRUCE ENTRE EL FORMULARIO DE ABOGADOS Y LAS CATEGORÍAS
// ============================================================
//
// El abogado elige por rama del derecho. La persona afectada elige por
// lo que le pasó. No son la misma lista y no tienen por qué serlo: una
// especialidad puede atender varias situaciones.
//
// Este es el cruce, opción por opción, según el formulario de Tally.
// Si cambias una opción allá, ajusta la palabra ancla de acá.

// Se calcula desde la lista real de categorías: si mañana agregas una,
// quien marcó "todas" la recibe sin que haya que tocar nada acá.
const TODAS = AREAS.map((a) => a.id);

const CRUCE: { ancla: string; areas: string[] }[] = [
  // H · Puedo atender todas las categorías
  //     Va de primera: quien marca esta opción cubre todo el abanico.
  { ancla: "todas las categor", areas: TODAS },

  // A · Derecho Civil / inmobiliario / Propiedad / Arrendamientos
  { ancla: "inmobiliario", areas: ["vivienda", "deudas"] },

  // B · Derecho Administrativo / Tutelas - Derechos de petición
  //     Recuperar cédula o registro civil es trámite registral, y las
  //     tutelas de salud son el pan de cada día de este perfil.
  //     Conserva "otro" como respaldo: si nadie marcó la opción de
  //     todas las categorías, alguien tiene que recibir los casos que
  //     llegan sin categoría clara.
  { ancla: "administrativo", areas: ["ayudas_estado", "documentos", "salud", "otro"] },

  // C · Seguros / Reclamaciones aseguradoras
  { ancla: "seguros", areas: ["seguros"] },

  // D · Derecho de Familia
  //     En la práctica quien lleva familia lleva sucesiones.
  { ancla: "familia", areas: ["familia", "fallecimiento"] },

  // E · Derecho Laboral
  { ancla: "laboral", areas: ["laboral"] },

  // F · Empresas, comercial y emprendimiento
  { ancla: "empresas", areas: ["empresas", "deudas"] },

  // G · Derecho Penal
  { ancla: "penal", areas: ["penal"] },
];

// Respaldo por palabras sueltas, para cuando alguien escribe libre o si
// se agrega una opción nueva sin actualizar el cruce de arriba.
const MAPA_AREAS: Record<string, string[]> = {
  vivienda: ["vivienda", "arrend", "arriendo", "inmobiliar", "propiedad horizontal", "urban"],
  seguros: ["seguro", "póliza", "poliza", "asegurad"],
  ayudas_estado: ["administrativ", "tutela", "petición", "peticion", "público", "publico", "constitucional", "humanitari"],
  documentos: ["registro civil", "notarial", "notaría", "notaria", "identificación", "documento", "cédula", "cedula"],
  fallecimiento: ["sucesi", "herencia", "mortuori", "defunción", "defuncion"],
  salud: ["salud", "eps", "pensi", "seguridad social", "arl", "riesgos laborales"],
  laboral: ["laboral", "trabajo", "empleo"],
  deudas: ["financier", "deuda", "crédito", "credito", "insolvencia", "bancari", "hipotec"],
  empresas: ["comercial", "societario", "mercantil", "corporativ", "empresa", "empresarial", "emprendimiento", "pyme"],
  familia: ["familia", "custodia", "alimentos", "menor", "infancia", "niñez", "ninez"],
  penal: ["penal", "delito", "denuncia", "víctimas", "victimas", "criminal"],
  otro: ["general", "otro", "cualquier", "orientación", "orientacion"],
};

const IDS_VALIDOS = new Set(AREAS.map((a) => a.id));

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarCampo(campos: TallyField[], claves: string[]) {
  for (const clave of claves) {
    const c = campos.find((f) =>
      normalizar(f.label ?? "").includes(normalizar(clave))
    );
    if (c) return c;
  }
  return undefined;
}

/** Convierte el valor de un campo en texto plano, resolviendo IDs de opción. */
function comoTexto(campo?: TallyField): string {
  if (!campo || campo.value === null || campo.value === undefined) return "";
  const { value, options } = campo;

  if (Array.isArray(value)) {
    return value
      .map((v) => options?.find((o) => o.id === v)?.text ?? String(v))
      .join(", ");
  }
  if (typeof value === "string") {
    return options?.find((o) => o.id === value)?.text ?? value;
  }
  return String(value);
}

function comoLista(campo?: TallyField): string[] {
  if (!campo) return [];
  const { value, options } = campo;
  const bruto = Array.isArray(value) ? value : [value];
  return bruto
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map((v) => options?.find((o) => o.id === v)?.text ?? String(v));
}

export function mapearAreas(etiquetas: string[]): string[] {
  const encontradas = new Set<string>();

  for (const etiqueta of etiquetas) {
    const n = normalizar(etiqueta);

    // Coincidencia directa con un id de la plataforma.
    if (IDS_VALIDOS.has(n)) {
      encontradas.add(n);
      continue;
    }

    // 1. El cruce explícito manda.
    const cruce = CRUCE.find((c) => n.includes(normalizar(c.ancla)));
    if (cruce) {
      cruce.areas.forEach((a) => encontradas.add(a));
      continue;
    }

    // 2. Si no reconoce la opción, cae al respaldo por palabras sueltas.
    for (const [areaId, palabras] of Object.entries(MAPA_AREAS)) {
      if (palabras.some((p) => n.includes(normalizar(p)))) {
        encontradas.add(areaId);
      }
    }
  }

  return [...encontradas].filter((a) => IDS_VALIDOS.has(a));
}

export function mapearAbogado(payload: any) {
  const campos: TallyField[] = payload?.data?.fields ?? [];

  const nombre = comoTexto(buscarCampo(campos, CLAVES.nombre)).trim();
  const email = comoTexto(buscarCampo(campos, CLAVES.email)).trim().toLowerCase();
  const telefono = comoTexto(buscarCampo(campos, CLAVES.telefono)).trim();
  const tarjeta = comoTexto(buscarCampo(campos, CLAVES.tarjeta)).trim();
  const ciudad = comoTexto(buscarCampo(campos, CLAVES.ciudad)).trim();
  const etiquetasArea = comoLista(buscarCampo(campos, CLAVES.areas));
  const cupoTexto = comoTexto(buscarCampo(campos, CLAVES.cupo));

  const cupo = parseInt(cupoTexto.replace(/\D/g, ""), 10);
  let areas = mapearAreas(etiquetasArea);

  // Un abogado sin área reconocida entra a orientación general en vez de
  // quedar inservible en la base.
  if (areas.length === 0) {
    console.warn(
      `[tally] No se reconoció el área de ${email || nombre}. Etiquetas: ${etiquetasArea.join(" | ")}`
    );
    areas = ["otro"];
  }

  return {
    nombre: nombre || "Sin nombre",
    email,
    telefono: telefono || null,
    tarjeta_profesional: tarjeta || null,
    ciudad: ciudad || null,
    areas,
    max_casos: Number.isFinite(cupo) && cupo > 0 ? Math.min(cupo, 20) : 3,
    activo: true,
    origen: "tally",
    tally_submission_id: payload?.data?.submissionId ?? payload?.data?.responseId ?? null,
  };
}
