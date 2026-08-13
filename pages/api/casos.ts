import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin, type Abogado, type Caso } from "@/db";
import { AREAS_POR_ID } from "@/areas";
import { confirmarPersona, notificarAbogado } from "@/email";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  const area = String(body.area ?? "").trim();
  const descripcion = String(body.descripcion ?? "").trim();
  const nombre = String(body.nombre ?? "").trim();
  const telefono = String(body.telefono ?? "").trim();
  const email = String(body.email ?? "").trim();
  const departamento = String(body.departamento ?? "").trim();
  const municipio = String(body.municipio ?? "").trim();
  const canal = String(body.canal ?? "llamada").trim();
  const urgencia = String(body.urgencia ?? "media").trim();
  const consentimiento = body.consentimiento === true;

  // -------- Validación --------
  if (!AREAS_POR_ID[area]) {
    return res.status(400).json({ error: "Elige un tema válido." });
  }
  if (descripcion.length < 25 || descripcion.length > 2500) {
    return res.status(400).json({ error: "Cuéntanos un poco más sobre tu caso." });
  }
  if (nombre.length < 3 || nombre.length > 120) {
    return res.status(400).json({ error: "Escribe tu nombre." });
  }
  if (telefono.replace(/\D/g, "").length < 7) {
    return res.status(400).json({ error: "Escribe un número de contacto válido." });
  }
  if (!["llamada", "whatsapp", "correo"].includes(canal)) {
    return res.status(400).json({ error: "Canal inválido." });
  }
  if (!["alta", "media", "baja"].includes(urgencia)) {
    return res.status(400).json({ error: "Urgencia inválida." });
  }
  if (!consentimiento) {
    return res
      .status(400)
      .json({ error: "Necesitamos tu autorización para tratar los datos." });
  }

  const db = supabaseAdmin();

  // -------- Asignación por rotación --------
  // La función de Postgres toma el siguiente abogado del área y le suma
  // un caso en la misma transacción, así que dos solicitudes simultáneas
  // nunca reciben el mismo abogado.
  const { data: asignados, error: errorAsignacion } = await db.rpc(
    "asignar_abogado",
    { p_area: area }
  );

  if (errorAsignacion) {
    console.error("[casos] Falló la asignación:", errorAsignacion);
    return res.status(500).json({
      error: "No pudimos procesar tu caso. Inténtalo de nuevo en un momento.",
    });
  }

  const abogado = (asignados as Abogado[] | null)?.[0] ?? null;

  // -------- Registro del caso --------
  const { data: caso, error: errorCaso } = await db
    .from("casos")
    .insert({
      area,
      descripcion,
      nombre_persona: nombre,
      telefono_persona: telefono,
      email_persona: email || null,
      departamento: departamento || null,
      municipio: municipio || null,
      canal_preferido: canal,
      urgencia,
      abogado_id: abogado?.id ?? null,
      estado: abogado ? "asignado" : "sin_abogado",
      consentimiento_datos: true,
    })
    .select()
    .single();

  if (errorCaso || !caso) {
    console.error("[casos] Falló el registro:", errorCaso);
    // Si el caso no se guardó, devolvemos el cupo que ya habíamos tomado.
    if (abogado) {
      await db
        .from("abogados")
        .update({ casos_asignados: Math.max(abogado.casos_asignados - 1, 0) })
        .eq("id", abogado.id);
    }
    return res
      .status(500)
      .json({ error: "No pudimos guardar tu caso. Inténtalo de nuevo." });
  }

  // -------- Notificaciones --------
  // Al abogado siempre; a la persona solo si dejó correo.
  // Si alguno falla, el caso ya quedó guardado y visible en el panel.
  if (abogado) {
    await Promise.allSettled([
      notificarAbogado(caso as Caso, abogado),
      confirmarPersona(caso as Caso, abogado),
    ]);
  }

  return res.status(200).json({
    radicado: (caso as Caso).radicado,
    estado: (caso as Caso).estado,
    abogado: abogado ? { nombre: abogado.nombre, ciudad: abogado.ciudad } : null,
  });
}
