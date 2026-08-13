import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/db";
import { mapearAbogado } from "@/tallymap";

// Necesitamos el cuerpo sin procesar para verificar la firma de Tally.
export const config = { api: { bodyParser: false } };

function leerCuerpo(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let datos = "";
    req.on("data", (fragmento) => (datos += fragmento));
    req.on("end", () => resolve(datos));
    req.on("error", reject);
  });
}

/**
 * Recibe cada nueva inscripción del formulario de Tally y la guarda
 * en la tabla de abogados. Configúralo en Tally → Integrations → Webhooks,
 * apuntando a https://TU-DOMINIO.vercel.app/api/tally
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const crudo = await leerCuerpo(req);

  // Verificación de firma. Si defines TALLY_SIGNING_SECRET, nadie más
  // puede inyectar abogados falsos en tu base.
  const secreto = process.env.TALLY_SIGNING_SECRET;
  if (secreto) {
    const firma = String(req.headers["tally-signature"] ?? "");
    const esperada = crypto
      .createHmac("sha256", secreto)
      .update(crudo)
      .digest("base64");
    const a = Buffer.from(firma);
    const b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "Firma inválida." });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(crudo);
  } catch {
    return res.status(400).json({ error: "JSON inválido." });
  }

  const abogado = mapearAbogado(payload);

  if (!abogado.email || !abogado.email.includes("@")) {
    console.error(
      "[tally] Respuesta sin correo válido:",
      JSON.stringify(payload?.data?.fields)
    );
    return res
      .status(422)
      .json({ error: "No se encontró un correo en la respuesta." });
  }

  const db = supabaseAdmin();

  // Si el mismo abogado se inscribe dos veces, se actualiza su registro
  // en vez de duplicarlo. No se toca `casos_asignados` ni `orden`.
  const { data: existente } = await db
    .from("abogados")
    .select("id")
    .eq("email", abogado.email)
    .maybeSingle();

  if (existente) {
    const { error } = await db
      .from("abogados")
      .update({
        nombre: abogado.nombre,
        telefono: abogado.telefono,
        tarjeta_profesional: abogado.tarjeta_profesional,
        ciudad: abogado.ciudad,
        areas: abogado.areas,
        max_casos: abogado.max_casos,
        activo: true,
      })
      .eq("id", existente.id);

    if (error) {
      console.error("[tally] Falló la actualización:", error);
      return res.status(500).json({ error: "Error al actualizar." });
    }
    return res.status(200).json({ ok: true, accion: "actualizado" });
  }

  const { error } = await db.from("abogados").insert(abogado);

  if (error) {
    console.error("[tally] Falló la inserción:", error);
    return res.status(500).json({ error: "Error al guardar." });
  }

  return res.status(200).json({ ok: true, accion: "creado", areas: abogado.areas });
}
