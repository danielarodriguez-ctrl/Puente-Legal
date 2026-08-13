import { Resend } from "resend";
import { AREAS_POR_ID } from "@/areas";
import type { Abogado, Caso } from "@/db";

const CANAL_LABEL: Record<string, string> = {
  llamada: "Llamada telefónica",
  whatsapp: "WhatsApp",
  correo: "Correo electrónico",
};

const URGENCIA_LABEL: Record<string, string> = {
  alta: "Urgente",
  media: "Importante",
  baja: "Consulta",
};

function plantilla(caso: Caso, abogado: Abogado) {
  const area = AREAS_POR_ID[caso.area];
  const telLimpio = caso.telefono_persona.replace(/\D/g, "");
  const wa = telLimpio.startsWith("57") ? telLimpio : `57${telLimpio}`;

  return `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#12212E;line-height:1.6">
  <div style="background:#12212E;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Puente Legal</div>
    <div style="font-size:20px;font-weight:600;margin-top:4px">Se te asignó un caso</div>
  </div>

  <div style="border:1px solid #E3DED6;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px">Hola ${abogado.nombre},</p>
    <p style="margin:0 0 20px">
      Te corresponde acompañar el caso <strong>${caso.radicado}</strong>.
      El acompañamiento es virtual o telefónico.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:15px;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6B6357;width:150px">Área</td><td style="padding:8px 0"><strong>${area?.nombreJuridico ?? caso.area}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#6B6357">Prioridad</td><td style="padding:8px 0">${URGENCIA_LABEL[caso.urgencia] ?? caso.urgencia}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6357">Persona</td><td style="padding:8px 0">${caso.nombre_persona}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6357">Teléfono</td><td style="padding:8px 0"><a href="tel:${caso.telefono_persona}" style="color:#1F6F5C">${caso.telefono_persona}</a></td></tr>
      ${caso.email_persona ? `<tr><td style="padding:8px 0;color:#6B6357">Correo</td><td style="padding:8px 0">${caso.email_persona}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#6B6357">Prefiere</td><td style="padding:8px 0">${CANAL_LABEL[caso.canal_preferido] ?? caso.canal_preferido}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6357">Ubicación</td><td style="padding:8px 0">${[caso.municipio, caso.departamento].filter(Boolean).join(", ") || "No indicada"}</td></tr>
    </table>

    <div style="background:#F7F4EF;border-left:3px solid #1F6F5C;padding:16px;border-radius:4px;margin-bottom:24px">
      <div style="font-size:13px;color:#6B6357;margin-bottom:6px">Lo que cuenta la persona</div>
      <div style="white-space:pre-wrap">${escapar(caso.descripcion)}</div>
    </div>

    <a href="https://wa.me/${wa}"
       style="display:inline-block;background:#1F6F5C;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">
      Escribir por WhatsApp
    </a>

    <p style="margin:24px 0 0;font-size:14px;color:#6B6357">
      Contacta a la persona dentro de las próximas 48 horas.
      Si no puedes tomar el caso, responde este correo para reasignarlo.
    </p>
  </div>
</div>`.trim();
}

function escapar(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function notificarAbogado(caso: Caso, abogado: Abogado) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_REMITENTE;

  // Sin correo configurado la plataforma sigue funcionando:
  // el caso queda guardado y visible en el panel.
  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY o EMAIL_REMITENTE sin configurar. Caso ${caso.radicado} no notificado.`
    );
    return { enviado: false, motivo: "sin_configurar" as const };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: abogado.email,
      replyTo: process.env.EMAIL_COORDINACION || from,
      subject: `[${caso.radicado}] Caso asignado — ${AREAS_POR_ID[caso.area]?.nombreJuridico ?? caso.area}`,
      html: plantilla(caso, abogado),
    });
    return { enviado: true as const };
  } catch (error) {
    console.error("[email] Falló el envío:", error);
    return { enviado: false, motivo: "error_envio" as const };
  }
}
