import { createClient } from "@supabase/supabase-js";

// Cliente de servidor. Usa la llave service_role, que nunca sale del backend.
// No importar este archivo desde un componente con "use client".
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltan las variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type Abogado = {
  id: string;
  orden: number;
  nombre: string;
  email: string;
  telefono: string | null;
  tarjeta_profesional: string | null;
  ciudad: string | null;
  areas: string[];
  activo: boolean;
  max_casos: number;
  casos_asignados: number;
  ultima_asignacion: string | null;
};

export type Caso = {
  id: string;
  radicado: string;
  area: string;
  descripcion: string;
  nombre_persona: string;
  telefono_persona: string;
  email_persona: string | null;
  departamento: string | null;
  municipio: string | null;
  canal_preferido: string;
  urgencia: string;
  abogado_id: string | null;
  estado: string;
  creado_en: string;
};
