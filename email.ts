import nodemailer from "nodemailer";
import { AREAS_POR_ID } from "@/areas";
import type { Abogado, Caso } from "@/db";

// El correo sale desde la cuenta de Gmail del colectivo, usando el servidor
// de Google. No hace falta dominio propio ni registros DNS: solo una
// contraseña de aplicación generada en la cuenta.
//
// Variables necesarias en Vercel:
//   GMAIL_USUARIO        legalhackers@gmail.com
//   GMAIL_CLAVE_APP      la clave de 16 letras que genera Google
//   EMAIL_COORDINACION   a dónde llegan las respuestas de los abogados

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

function escapar(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** URL pública del sitio. Vercel la expone sola; la variable es un respaldo. */
function urlSitio() {
  const propia = process.env.NEXT_PUBLIC_SITIO_URL;
  if (propia) return propia.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "";
}

function plantilla(caso: Caso, abogado: Abogado) {
  const area = AREAS_POR_ID[caso.area];
  const base = urlSitio();
  const enlaceContacto = base ? `${base}/api/contacto?id=${caso.id}` : "";
  const telLimpio = caso.telefono_persona.replace(/\D/g, "");
  const wa = telLimpio.startsWith("57") ? telLimpio : `57${telLimpio}`;

  return `
<div style="font-family:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111111;line-height:1.6">
  <div style="background:#E52320;color:#fff;padding:22px 24px;border-radius:8px 8px 0 0">
    <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.9;font-weight:600">Puente Legal</div>
    <div style="font-size:20px;font-weight:600;margin-top:4px">Se te asignó un caso</div>
  </div>

  <div style="border:1px solid #E6E6E6;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px">Hola ${escapar(abogado.nombre)},</p>
    <p style="margin:0 0 20px">
      Te corresponde acompañar el caso <strong>${caso.radicado}</strong>.
      El acompañamiento es virtual o telefónico.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:15px;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6B6B6B;width:150px">Área</td><td style="padding:8px 0"><strong>${area?.nombreJuridico ?? caso.area}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#6B6B6B">Prioridad</td><td style="padding:8px 0">${URGENCIA_LABEL[caso.urgencia] ?? caso.urgencia}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6B6B">Persona</td><td style="padding:8px 0">${escapar(caso.nombre_persona)}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6B6B">Teléfono</td><td style="padding:8px 0"><a href="tel:${caso.telefono_persona}" style="color:#B81C19">${escapar(caso.telefono_persona)}</a></td></tr>
      ${caso.email_persona ? `<tr><td style="padding:8px 0;color:#6B6B6B">Correo</td><td style="padding:8px 0">${escapar(caso.email_persona)}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#6B6B6B">Prefiere</td><td style="padding:8px 0">${CANAL_LABEL[caso.canal_preferido] ?? caso.canal_preferido}</td></tr>
      <tr><td style="padding:8px 0;color:#6B6B6B">Ubicación</td><td style="padding:8px 0">${escapar([caso.municipio, caso.departamento].filter(Boolean).join(", ") || "No indicada")}</td></tr>
    </table>

    <div style="background:#FAFAFA;border-left:4px solid #E52320;padding:16px;border-radius:4px;margin-bottom:24px">
      <div style="font-size:13px;color:#6B6B6B;margin-bottom:6px">Lo que cuenta la persona</div>
      <div style="white-space:pre-wrap">${escapar(caso.descripcion)}</div>
    </div>

    <a href="https://wa.me/${wa}"
       style="display:inline-block;background:#E52320;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">
      Escribir por WhatsApp
    </a>

    ${enlaceContacto ? `
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #E6E6E6">
      <div style="font-size:14px;color:#6B6B6B;margin-bottom:10px">
        Cuando ya hayas hablado con la persona, avísanos con un clic. Nos sirve
        para saber qué casos siguen sin atender.
      </div>
      <a href="${enlaceContacto}"
         style="display:inline-block;border:2px solid #E52320;color:#B81C19;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">
        Ya contacté a esta persona
      </a>
    </div>` : ""}

    <p style="margin:24px 0 0;font-size:14px;color:#6B6B6B">
      Contacta a la persona dentro de las próximas 48 horas.
      Si no puedes tomar el caso, responde este correo para reasignarlo.
    </p>
  </div>
</div>`.trim();
}

function textoPlano(caso: Caso, abogado: Abogado) {
  const area = AREAS_POR_ID[caso.area];
  return [
    `Hola ${abogado.nombre},`,
    ``,
    `Te corresponde acompañar el caso ${caso.radicado}.`,
    `El acompañamiento es virtual o telefónico.`,
    ``,
    `Área: ${area?.nombreJuridico ?? caso.area}`,
    `Prioridad: ${URGENCIA_LABEL[caso.urgencia] ?? caso.urgencia}`,
    `Persona: ${caso.nombre_persona}`,
    `Teléfono: ${caso.telefono_persona}`,
    caso.email_persona ? `Correo: ${caso.email_persona}` : null,
    `Prefiere: ${CANAL_LABEL[caso.canal_preferido] ?? caso.canal_preferido}`,
    `Ubicación: ${[caso.municipio, caso.departamento].filter(Boolean).join(", ") || "No indicada"}`,
    ``,
    `Lo que cuenta la persona:`,
    caso.descripcion,
    ``,
    `Contacta a la persona dentro de las próximas 48 horas.`,
    `Si no puedes tomar el caso, responde este correo para reasignarlo.`,
    ``,
    urlSitio() ? `Cuando ya hayas hablado con la persona, avísanos abriendo este enlace:` : null,
    urlSitio() ? `${urlSitio()}/api/contacto?id=${caso.id}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export async function notificarAbogado(caso: Caso, abogado: Abogado) {
  const usuario = process.env.GMAIL_USUARIO;
  const clave = process.env.GMAIL_CLAVE_APP;

  // Sin credenciales la plataforma sigue funcionando: el caso queda
  // guardado y visible en el panel, solo que nadie recibe aviso.
  if (!usuario || !clave) {
    console.warn(
      `[email] Faltan GMAIL_USUARIO o GMAIL_CLAVE_APP. Caso ${caso.radicado} sin notificar.`
    );
    return { enviado: false, motivo: "sin_configurar" as const };
  }

  try {
    const transporte = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: usuario,
        // Google exige la clave sin espacios. La mostramos separada en
        // grupos de cuatro, así que la limpiamos por si la pegan tal cual.
        pass: clave.replace(/\s+/g, ""),
      },
    });

    await transporte.sendMail({
      from: `"Puente Legal" <${usuario}>`,
      to: abogado.email,
      replyTo: process.env.EMAIL_COORDINACION || usuario,
      subject: `[${caso.radicado}] Caso asignado — ${AREAS_POR_ID[caso.area]?.nombreJuridico ?? caso.area}`,
      text: textoPlano(caso, abogado),
      html: plantilla(caso, abogado),
    });

    console.log(`[email] Caso ${caso.radicado} notificado a ${abogado.email}`);
    return { enviado: true as const };
  } catch (error) {
    console.error(`[email] Falló el envío del caso ${caso.radicado}:`, error);
    return { enviado: false, motivo: "error_envio" as const };
  }
}

// ---------------------------------------------------------------
// Correo de confirmación para la persona afectada
// ---------------------------------------------------------------

function plantillaPersona(caso: Caso, abogado: Abogado) {
  const area = AREAS_POR_ID[caso.area];
  const coordinacion = process.env.EMAIL_COORDINACION || process.env.GMAIL_USUARIO || "";

  return `
<div style="font-family:Montserrat,'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#111111;line-height:1.6">
  <div style="background:#E52320;color:#fff;padding:22px 24px;border-radius:8px 8px 0 0">
    <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.9;font-weight:600">Puente Legal</div>
    <div style="font-size:20px;font-weight:600;margin-top:4px">Tu caso quedó registrado</div>
  </div>

  <div style="border:1px solid #E6E6E6;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px">Hola ${escapar(caso.nombre_persona)},</p>

    <p style="margin:0 0 20px">
      Recibimos tu solicitud sobre <strong>${escapar(area?.nombreJuridico ?? caso.area)}</strong>.
      Ya tienes un abogado voluntario asignado.
    </p>

    <div style="background:#FAFAFA;padding:16px;border-radius:6px;margin-bottom:24px">
      <div style="font-size:13px;color:#6B6B6B">Tu número de caso</div>
      <div style="font-size:24px;font-weight:700;letter-spacing:.05em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:4px">${caso.radicado}</div>
      <div style="font-size:14px;color:#6B6B6B;margin-top:6px">Guárdalo. Te sirve para cualquier consulta sobre tu caso.</div>
    </div>

    <div style="border:2px solid #E52320;border-radius:6px;padding:16px;margin-bottom:24px">
      <div style="font-size:13px;color:#6B6B6B;margin-bottom:8px">Tu abogado asignado</div>
      <div style="font-size:18px;font-weight:600">${escapar(abogado.nombre)}</div>
      ${abogado.ciudad ? `<div style="color:#6B6B6B;font-size:14px">${escapar(abogado.ciudad)}</div>` : ""}
    </div>

    <div style="background:#FAFAFA;border-left:4px solid #E52320;padding:16px;border-radius:4px;margin-bottom:24px">
      <div style="font-weight:600;margin-bottom:6px">Qué sigue ahora</div>
      <div style="font-size:15px">
        No tienes que hacer nada. El abogado ya recibió tu caso y te va a
        contactar dentro de las próximas <strong>48 horas</strong> al número
        que nos dejaste.
        ${coordinacion ? `<br><br>Si pasan las 48 horas y nadie te ha buscado, escríbenos a <a href="mailto:${escapar(coordinacion)}" style="color:#B81C19">${escapar(coordinacion)}</a> con tu número de caso y te asignamos otro abogado.` : ""}
      </div>
    </div>

    <div style="font-size:14px;color:#6B6B6B;border-top:1px solid #E6E6E6;padding-top:16px">
      <p style="margin:0 0 10px">
        Este acompañamiento es gratuito y se hace por teléfono o de forma virtual.
        Ningún abogado de Puente Legal puede pedirte dinero. Si alguien te lo pide,
        avísanos.
      </p>
      <p style="margin:0">
        Antes de compartir documentos, puedes pedirle su número de tarjeta
        profesional y verificarlo en el registro del Consejo Superior de la
        Judicatura.
      </p>
    </div>
  </div>
</div>`.trim();
}

function textoPlanoPersona(caso: Caso, abogado: Abogado) {
  const area = AREAS_POR_ID[caso.area];
  return [
    `Hola ${caso.nombre_persona},`,
    ``,
    `Recibimos tu solicitud sobre ${area?.nombreJuridico ?? caso.area}.`,
    `Ya tienes un abogado voluntario asignado.`,
    ``,
    `TU NÚMERO DE CASO: ${caso.radicado}`,
    `Guárdalo. Te sirve para cualquier consulta sobre tu caso.`,
    ``,
    `TU ABOGADO ASIGNADO`,
    `${abogado.nombre}${abogado.ciudad ? ` — ${abogado.ciudad}` : ""}`,
    ``,
    `QUÉ SIGUE AHORA`,
    `No tienes que hacer nada. El abogado ya recibió tu caso y te va a contactar`,
    `dentro de las próximas 48 horas al número que nos dejaste.`,
    process.env.EMAIL_COORDINACION
      ? `Si pasan las 48 horas y nadie te busca, escríbenos a ${process.env.EMAIL_COORDINACION} con tu número de caso.`
      : null,
    ``,
    `Este acompañamiento es gratuito. Ningún abogado de Puente Legal puede pedirte dinero.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/** Avisa a la persona afectada. Solo se envía si dejó un correo. */
export async function confirmarPersona(caso: Caso, abogado: Abogado) {
  const usuario = process.env.GMAIL_USUARIO;
  const clave = process.env.GMAIL_CLAVE_APP;

  if (!caso.email_persona) {
    return { enviado: false, motivo: "sin_correo" as const };
  }
  if (!usuario || !clave) {
    return { enviado: false, motivo: "sin_configurar" as const };
  }

  try {
    const transporte = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: usuario, pass: clave.replace(/\s+/g, "") },
    });

    await transporte.sendMail({
      from: `"Puente Legal" <${usuario}>`,
      to: caso.email_persona,
      replyTo: process.env.EMAIL_COORDINACION || usuario,
      subject: `Tu caso ${caso.radicado} — ya tienes abogado asignado`,
      text: textoPlanoPersona(caso, abogado),
      html: plantillaPersona(caso, abogado),
    });

    console.log(`[email] Confirmación del caso ${caso.radicado} enviada a la persona`);
    return { enviado: true as const };
  } catch (error) {
    console.error(`[email] Falló la confirmación del caso ${caso.radicado}:`, error);
    return { enviado: false, motivo: "error_envio" as const };
  }
}
