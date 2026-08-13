import type { GetServerSideProps } from "next";
import { supabaseAdmin, type Abogado, type Caso } from "@/db";
import { AREAS_POR_ID } from "@/areas";

const COOKIE = "pl_admin";

const COLOR_ESTADO: Record<string, string> = {
  asignado: "bg-acento/15 text-acentoOscuro",
  sin_abogado: "bg-alerta/15 text-alerta",
  contactado: "bg-tinta/10 text-tinta",
  cerrado: "bg-tinta/10 text-tinta/50",
};

type Props = {
  autenticado: boolean;
  hayClave: boolean;
  error: boolean;
  casos: Caso[];
  abogados: Abogado[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const clave = process.env.ADMIN_PASSWORD;
  const autenticado = Boolean(clave) && ctx.req.cookies?.[COOKIE] === clave;
  const error = ctx.query.error === "1";

  if (!autenticado) {
    return {
      props: {
        autenticado: false,
        hayClave: Boolean(clave),
        error,
        casos: [],
        abogados: [],
      },
    };
  }

  const db = supabaseAdmin();
  const [{ data: casos }, { data: abogados }] = await Promise.all([
    db.from("casos").select("*").order("creado_en", { ascending: false }).limit(200),
    db.from("abogados").select("*").order("orden", { ascending: true }),
  ]);

  return {
    props: {
      autenticado: true,
      hayClave: true,
      error: false,
      casos: (casos ?? []) as Caso[],
      abogados: (abogados ?? []) as Abogado[],
    },
  };
};

export default function Admin({
  autenticado,
  hayClave,
  error,
  casos,
  abogados,
}: Props) {
  if (!autenticado) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16">
        <h1 className="text-2xl font-bold">Panel de coordinación</h1>
        <form action="/api/admin" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="accion" value="entrar" />
          <input
            type="password"
            name="password"
            className="campo"
            placeholder="Contraseña"
            autoFocus
          />
          <button className="btn-primario w-full">Entrar</button>
        </form>
        {error && <p className="mt-4 text-sm text-alerta">Contraseña incorrecta.</p>}
        {!hayClave && (
          <p className="mt-4 text-sm text-tinta/60">
            Falta definir la variable de entorno{" "}
            <code className="font-mono">ADMIN_PASSWORD</code> en Vercel.
          </p>
        )}
      </div>
    );
  }

  const porId = new Map(abogados.map((a) => [a.id, a]));
  const sinAsignar = casos.filter((c) => c.estado === "sin_abogado").length;
  const activos = abogados.filter((a) => a.activo).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">Panel de coordinación</h1>
        <form action="/api/admin" method="post">
          <input type="hidden" name="accion" value="salir" />
          <button className="btn-secundario">Salir</button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Casos totales", casos.length],
          ["Sin abogado", sinAsignar],
          ["Abogados activos", activos],
          ["Abogados en lista", abogados.length],
        ].map(([k, v]) => (
          <div
            key={k as string}
            className="rounded-lg border-2 border-tinta/15 bg-white p-4"
          >
            <div className="text-2xl font-bold">{v as number}</div>
            <div className="text-sm text-tinta/60">{k as string}</div>
          </div>
        ))}
      </div>

      {/* Casos */}
      <h2 className="mt-10 text-lg font-semibold">Casos</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border-2 border-tinta/15 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-tinta/10 text-xs uppercase tracking-wide text-tinta/50">
            <tr>
              <th className="px-3 py-3">Radicado</th>
              <th className="px-3 py-3">Área</th>
              <th className="px-3 py-3">Persona</th>
              <th className="px-3 py-3">Contacto</th>
              <th className="px-3 py-3">Abogado</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tinta/10">
            {casos.map((c) => (
              <tr key={c.id} className={c.urgencia === "alta" ? "bg-alerta/5" : ""}>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                  {c.radicado}
                  {c.urgencia === "alta" && (
                    <span className="ml-2 rounded bg-alerta px-1.5 py-0.5 text-[10px] font-sans font-bold text-white">
                      URGENTE
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {AREAS_POR_ID[c.area]?.nombreJuridico ?? c.area}
                </td>
                <td className="px-3 py-3">{c.nombre_persona}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <a href={`tel:${c.telefono_persona}`} className="text-acento underline">
                    {c.telefono_persona}
                  </a>
                </td>
                <td className="px-3 py-3">
                  {c.abogado_id ? porId.get(c.abogado_id)?.nombre ?? "—" : "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      COLOR_ESTADO[c.estado] ?? "bg-tinta/10"
                    }`}
                  >
                    {c.estado.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {c.estado !== "cerrado" && (
                    <form action="/api/admin" method="post">
                      <input type="hidden" name="accion" value="cerrar" />
                      <input type="hidden" name="radicado" value={c.radicado} />
                      <button className="text-xs text-tinta/60 underline">Cerrar</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {casos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-tinta/50">
                  Todavía no hay casos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Abogados */}
      <h2 className="mt-10 text-lg font-semibold">Abogados en la lista</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border-2 border-tinta/15 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-tinta/10 text-xs uppercase tracking-wide text-tinta/50">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">T.P.</th>
              <th className="px-3 py-3">Ciudad</th>
              <th className="px-3 py-3">Áreas</th>
              <th className="px-3 py-3">Carga</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tinta/10">
            {abogados.map((a) => (
              <tr key={a.id} className={a.activo ? "" : "opacity-45"}>
                <td className="px-3 py-3 font-mono text-xs">{a.orden}</td>
                <td className="px-3 py-3">
                  <div className="font-medium">{a.nombre}</div>
                  <div className="text-xs text-tinta/55">{a.email}</div>
                </td>
                <td className="px-3 py-3 font-mono text-xs">
                  {a.tarjeta_profesional || (
                    <span className="text-alerta">sin registrar</span>
                  )}
                </td>
                <td className="px-3 py-3">{a.ciudad ?? "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.areas.map((x) => (
                      <span key={x} className="rounded bg-tinta/10 px-1.5 py-0.5 text-xs">
                        {x}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {a.casos_asignados} / {a.max_casos}
                </td>
                <td className="px-3 py-3">
                  <form action="/api/admin" method="post">
                    <input type="hidden" name="accion" value="alternar" />
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="activo" value={String(a.activo)} />
                    <button className="text-xs text-tinta/60 underline">
                      {a.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {abogados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-tinta/50">
                  Todavía no hay abogados. Conecta el webhook de Tally o importa el CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
