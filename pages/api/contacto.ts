import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/db";

/**
 * Enlace de un solo clic que el abogado recibe en su correo.
 * Al abrirlo, el caso queda marcado como contactado y la coordinación
 * puede ver quién ya hizo el primer contacto y quién no.
 *
 * El identificador del caso es un UUID aleatorio: no se puede adivinar,
 * así que sirve como llave sin necesidad de que el abogado inicie sesión.
 */

function pagina(titulo: string, mensaje: string, ok: boolean) {
  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<title>${titulo} — Puente Legal</title>
<style>
  body{margin:0;background:#FAFAFA;color:#111111;font-family:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6}
  .caja{max-width:520px;margin:12vh auto;padding:0 0 28px;background:#fff;overflow:hidden;border:2px solid ${ok ? "#E52320" : "#E26409"}33;border-radius:12px}
  .cinta{background:${ok ? "#E52320" : "#E26409"};color:#fff;padding:18px 24px}
  .cinta .et{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.9;font-weight:600}
  .adentro{padding:24px 24px 0}
  .icono{font-size:38px;line-height:1}
  h1{font-size:22px;margin:16px 0 8px}
  p{margin:0;color:#111111CC}
  a{color:#B81C19}
</style>
</head>
<body>
  <div class="caja">
    <div class="cinta"><div class="et">Puente Legal</div></div>
    <div class="adentro">
      <div class="icono">${ok ? "✅" : "⚠️"}</div>
      <h1>${titulo}</h1>
      <p>${mensaje}</p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = String(req.query.id ?? "").trim();
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  const esUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!esUuid) {
    return res
      .status(400)
      .send(pagina("Enlace inválido", "Revisa que hayas abierto el enlace completo del correo.", false));
  }

  const db = supabaseAdmin();

  const { data: caso, error } = await db
    .from("casos")
    .select("radicado, estado, contactado_en")
    .eq("id", id)
    .maybeSingle();

  if (error || !caso) {
    return res
      .status(404)
      .send(pagina("No encontramos el caso", "Es posible que el enlace esté incompleto o que el caso ya no exista.", false));
  }

  if (caso.contactado_en) {
    return res.status(200).send(
      pagina(
        "Ya estaba registrado",
        `El caso <strong>${caso.radicado}</strong> ya figuraba como contactado. No tienes que hacer nada más.`,
        true
      )
    );
  }

  const { error: errorUpdate } = await db
    .from("casos")
    .update({ estado: "contactado", contactado_en: new Date().toISOString() })
    .eq("id", id);

  if (errorUpdate) {
    console.error("[contacto] Falló la marca:", errorUpdate);
    return res
      .status(500)
      .send(pagina("Algo falló", "No pudimos registrar el contacto. Inténtalo de nuevo en un momento.", false));
  }

  console.log(`[contacto] Caso ${caso.radicado} marcado como contactado`);

  return res.status(200).send(
    pagina(
      "Gracias, quedó registrado",
      `Anotamos que ya hiciste el primer contacto del caso <strong>${caso.radicado}</strong>. Cuando termines el acompañamiento, avísale a la coordinación para liberar tu cupo y recibir otro caso.`,
      true
    )
  );
}
