import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/db";

const COOKIE = "pl_admin";

export function estaAutenticado(req: NextApiRequest | { cookies: Partial<Record<string, string>> }) {
  const clave = process.env.ADMIN_PASSWORD;
  if (!clave) return false;
  return req.cookies?.[COOKIE] === clave;
}

function galleta(valor: string, segundos: number) {
  const partes = [
    `${COOKIE}=${valor}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${segundos}`,
  ];
  if (process.env.NODE_ENV === "production") partes.push("Secure");
  return partes.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const accion = String(req.body?.accion ?? "");

  // ---- Entrar ----
  if (accion === "entrar") {
    const clave = process.env.ADMIN_PASSWORD;
    const intento = String(req.body?.password ?? "");
    if (!clave || intento !== clave) {
      res.setHeader("Location", "/admin?error=1");
      return res.status(302).end();
    }
    res.setHeader("Set-Cookie", galleta(clave, 60 * 60 * 12));
    res.setHeader("Location", "/admin");
    return res.status(302).end();
  }

  // ---- Salir ----
  if (accion === "salir") {
    res.setHeader("Set-Cookie", galleta("", 0));
    res.setHeader("Location", "/admin");
    return res.status(302).end();
  }

  // A partir de aquí hay que estar autenticado.
  if (!estaAutenticado(req)) {
    res.setHeader("Location", "/admin");
    return res.status(302).end();
  }

  const db = supabaseAdmin();

  // ---- Activar o desactivar un abogado ----
  if (accion === "alternar") {
    const id = String(req.body?.id ?? "");
    const activo = String(req.body?.activo ?? "") === "true";
    await db.from("abogados").update({ activo: !activo }).eq("id", id);
    res.setHeader("Location", "/admin");
    return res.status(302).end();
  }

  // ---- Cerrar un caso y liberar el cupo ----
  if (accion === "cerrar") {
    const radicado = String(req.body?.radicado ?? "");
    await db.rpc("cerrar_caso", { p_radicado: radicado });
    res.setHeader("Location", "/admin");
    return res.status(302).end();
  }

  res.setHeader("Location", "/admin");
  return res.status(302).end();
}
