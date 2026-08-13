-- ============================================================
-- Puente Legal — esquema de base de datos
-- Pega este archivo completo en Supabase → SQL Editor → Run
-- ============================================================

-- ---------- 1. Abogados voluntarios ----------
create table if not exists abogados (
  id                  uuid primary key default gen_random_uuid(),
  orden               bigserial,              -- posición en la lista (orden de inscripción)
  nombre              text not null,
  email               text not null,
  telefono            text,
  tarjeta_profesional text,
  ciudad              text,
  areas               text[] not null default '{}',   -- ids de lib/areas.ts
  activo              boolean not null default true,
  max_casos           integer not null default 3,     -- tope de casos simultáneos
  casos_asignados     integer not null default 0,
  ultima_asignacion   timestamptz,
  origen              text default 'tally',
  tally_submission_id text unique,
  creado_en           timestamptz not null default now()
);

create index if not exists abogados_rotacion_idx
  on abogados (activo, casos_asignados, orden);

-- ---------- 2. Casos de personas afectadas ----------
create sequence if not exists radicado_seq start 1;

create table if not exists casos (
  id                   uuid primary key default gen_random_uuid(),
  radicado             text unique not null
                         default 'PL-' || to_char(now() at time zone 'America/Bogota', 'YYMMDD')
                                 || '-' || lpad(nextval('radicado_seq')::text, 4, '0'),
  area                 text not null,
  descripcion          text not null,
  nombre_persona       text not null,
  telefono_persona     text not null,
  email_persona        text,
  departamento         text,
  municipio            text,
  canal_preferido      text not null default 'llamada',
  urgencia             text not null default 'media',
  abogado_id           uuid references abogados(id) on delete set null,
  estado               text not null default 'asignado',
    -- asignado | sin_abogado | contactado | cerrado
  consentimiento_datos boolean not null default false,
  creado_en            timestamptz not null default now()
);

create index if not exists casos_area_idx on casos (area, creado_en desc);
create index if not exists casos_abogado_idx on casos (abogado_id);

-- ---------- 3. Motor de asignación (rotación por área) ----------
-- Toma el siguiente abogado del área: el que menos casos tiene y,
-- en empate, el que va primero en la lista. SKIP LOCKED evita que dos
-- solicitudes simultáneas se lleven al mismo abogado.

create or replace function asignar_abogado(p_area text)
returns setof abogados
language plpgsql
as $$
declare
  v_id uuid;
begin
  select a.id into v_id
  from abogados a
  where a.activo = true
    and p_area = any(a.areas)
    and a.casos_asignados < a.max_casos
  order by a.casos_asignados asc, a.orden asc
  for update skip locked
  limit 1;

  if v_id is null then
    return;
  end if;

  return query
  update abogados
     set casos_asignados   = casos_asignados + 1,
         ultima_asignacion = now()
   where id = v_id
  returning *;
end;
$$;

-- Libera un cupo cuando el caso se cierra.
create or replace function cerrar_caso(p_radicado text)
returns void
language plpgsql
as $$
declare
  v_abogado uuid;
begin
  update casos
     set estado = 'cerrado'
   where radicado = p_radicado
     and estado <> 'cerrado'
  returning abogado_id into v_abogado;

  if v_abogado is not null then
    update abogados
       set casos_asignados = greatest(casos_asignados - 1, 0)
     where id = v_abogado;
  end if;
end;
$$;

-- ---------- 4. Seguridad ----------
-- RLS activo y sin políticas públicas: nadie puede leer estas tablas
-- con la llave anónima. Solo el servidor de Vercel, que usa service_role.

alter table abogados enable row level security;
alter table casos    enable row level security;
