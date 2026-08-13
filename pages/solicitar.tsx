import { useState } from "react";
import {
  AREAS,
  AREAS_POR_ID,
  CANALES,
  DEPARTAMENTOS_AFECTADOS,
  OTROS_DEPARTAMENTOS,
  URGENCIAS,
} from "@/areas";

type Respuesta = {
  radicado: string;
  abogado: { nombre: string; ciudad: string | null } | null;
  estado: string;
};

const TOTAL_PASOS = 4;

export default function Solicitar() {
  const [paso, setPaso] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Respuesta | null>(null);

  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urgencia, setUrgencia] = useState("media");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [canal, setCanal] = useState("llamada");
  const [consentimiento, setConsentimiento] = useState(false);

  const areaElegida = AREAS_POR_ID[area];

  function avanzar() {
    setError(null);
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function retroceder() {
    setError(null);
    setPaso((p) => Math.max(p - 1, 1));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch("/api/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area,
          descripcion,
          urgencia,
          nombre,
          telefono,
          email,
          departamento,
          municipio,
          canal,
          consentimiento,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "No pudimos registrar tu caso.");
      setResultado(data);
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Algo falló al enviar. Revisa tu conexión e inténtalo otra vez."
      );
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Pantalla final ----------
  if (resultado) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border-2 border-acento/30 bg-white p-6 sm:p-8">
          <div className="text-4xl">✅</div>
          <h1 className="mt-4 text-2xl font-bold">Tu caso quedó registrado</h1>

          <div className="mt-6 rounded-lg bg-arena p-4">
            <div className="text-sm text-tinta/60">Tu número de caso</div>
            <div className="mt-1 font-mono text-2xl font-bold tracking-wide">
              {resultado.radicado}
            </div>
            <div className="mt-2 text-sm text-tinta/70">
              Anótalo o toma una foto de esta pantalla.
            </div>
          </div>

          {resultado.abogado ? (
            <div className="mt-6 space-y-3 text-lg leading-relaxed">
              <p>
                Tu caso quedó asignado a{" "}
                <strong>{resultado.abogado.nombre}</strong>
                {resultado.abogado.ciudad ? `, de ${resultado.abogado.ciudad}` : ""}.
              </p>
              <p>
                Ya recibió los datos de tu caso y te va a contactar por{" "}
                <strong>
                  {CANALES.find((c) => c.id === canal)?.label.toLowerCase()}
                </strong>{" "}
                dentro de las próximas 48 horas.
              </p>
              <p className="text-base text-tinta/70">
                No tienes que hacer nada más. Si en 48 horas nadie te contacta,
                vuelve a esta página y registra el caso de nuevo mencionando tu
                número anterior.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-lg leading-relaxed">
              <p>
                En este momento todos los abogados de{" "}
                <strong>{areaElegida?.nombreJuridico}</strong> tienen su cupo lleno.
              </p>
              <p>
                Tu caso quedó en la fila y se asignará apenas se libere un cupo.
                El equipo de coordinación lo está revisando.
              </p>
            </div>
          )}
        </div>

        <a href="/" className="btn-secundario mt-6">
          Volver al inicio
        </a>
      </div>
    );
  }

  // ---------- Formulario ----------
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-tinta/60">
          <span>
            Paso {paso} de {TOTAL_PASOS}
          </span>
          {areaElegida && paso > 1 && (
            <span className="max-w-[60%] truncate">{areaElegida.nombreJuridico}</span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-tinta/10">
          <div
            className="h-full rounded-full bg-acento transition-all duration-300"
            style={{ width: `${(paso / TOTAL_PASOS) * 100}%` }}
          />
        </div>
      </div>

      {/* PASO 1 — Área */}
      {paso === 1 && (
        <section>
          <h1 className="text-2xl font-bold sm:text-3xl">
            ¿Con qué necesitas ayuda?
          </h1>
          <p className="mt-2 text-tinta/70">
            Elige lo que más se parezca a tu situación. Si dudas, escoge la última
            opción.
          </p>

          <div className="mt-6 space-y-3">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setArea(a.id);
                  avanzar();
                }}
                className={`flex w-full gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                  area === a.id
                    ? "border-acento bg-acento/5"
                    : "border-tinta/15 bg-white hover:border-acento/50"
                }`}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {a.icono}
                </span>
                <span>
                  <span className="block font-semibold leading-snug">{a.titulo}</span>
                  <span className="mt-1 block text-sm text-tinta/60">{a.ejemplos}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* PASO 2 — El caso */}
      {paso === 2 && (
        <section>
          <h1 className="text-2xl font-bold sm:text-3xl">¿Qué pasó?</h1>
          <p className="mt-2 text-tinta/70">
            Cuéntalo con tus palabras. No necesitas términos legales. Entre más
            detalles des, mejor te puede ayudar el abogado.
          </p>

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={7}
            maxLength={2500}
            placeholder="Por ejemplo: el edificio donde vivo arrendado quedó con la estructura afectada y nos sacaron. El arrendador dice que igual tengo que pagar el mes. Firmamos contrato en marzo."
            className="campo mt-6 resize-y"
          />
          <div className="mt-1 text-right text-sm text-tinta/50">
            {descripcion.length} / 2500
          </div>

          <div className="mt-8">
            <span className="etiqueta">¿Qué tan urgente es?</span>
            <div className="space-y-3">
              {URGENCIAS.map((u) => (
                <label
                  key={u.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 ${
                    urgencia === u.id
                      ? "border-acento bg-acento/5"
                      : "border-tinta/15 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgencia"
                    value={u.id}
                    checked={urgencia === u.id}
                    onChange={(e) => setUrgencia(e.target.value)}
                    className="mt-1 h-5 w-5 min-h-0 shrink-0 accent-acento"
                  />
                  <span>
                    <span className="block font-semibold">{u.label}</span>
                    <span className="mt-0.5 block text-sm text-tinta/60">
                      {u.detalle}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              className="btn-primario"
              disabled={descripcion.trim().length < 25}
              onClick={avanzar}
            >
              Continuar
            </button>
            <button className="btn-secundario" onClick={retroceder}>
              Atrás
            </button>
          </div>
          {descripcion.trim().length > 0 && descripcion.trim().length < 25 && (
            <p className="mt-3 text-sm text-alerta">
              Escribe un poco más para que el abogado entienda tu situación.
            </p>
          )}
        </section>
      )}

      {/* PASO 3 — Contacto */}
      {paso === 3 && (
        <section>
          <h1 className="text-2xl font-bold sm:text-3xl">¿Cómo te contactamos?</h1>
          <p className="mt-2 text-tinta/70">
            El abogado te va a buscar directamente. Estos datos solo los ve él.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="nombre" className="etiqueta">
                Tu nombre
              </label>
              <input
                id="nombre"
                className="campo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                placeholder="Nombre y apellido"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="etiqueta">
                Número de celular
              </label>
              <input
                id="telefono"
                className="campo"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="300 123 4567"
              />
              <p className="mt-1 text-sm text-tinta/55">
                Si no tienes celular propio, pon el de alguien que pueda recibir el
                mensaje por ti.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="etiqueta">
                Correo electrónico{" "}
                <span className="font-normal text-tinta/50">(opcional)</span>
              </label>
              <input
                id="email"
                type="email"
                className="campo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <span className="etiqueta">¿Cómo prefieres que te contacten?</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                {CANALES.map((c) => (
                  <label
                    key={c.id}
                    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 ${
                      canal === c.id
                        ? "border-acento bg-acento/5"
                        : "border-tinta/15 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="canal"
                      value={c.id}
                      checked={canal === c.id}
                      onChange={(e) => setCanal(e.target.value)}
                      className="h-5 w-5 min-h-0 shrink-0 accent-acento"
                    />
                    <span className="font-medium">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="departamento" className="etiqueta">
                  Departamento
                </label>
                <select
                  id="departamento"
                  className="campo"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                >
                  <option value="">Selecciona</option>
                  <optgroup label="Zonas con mayor afectación">
                    {DEPARTAMENTOS_AFECTADOS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Resto del país">
                    {OTROS_DEPARTAMENTOS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label htmlFor="municipio" className="etiqueta">
                  Municipio o barrio
                </label>
                <input
                  id="municipio"
                  className="campo"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Por ejemplo: Manizales"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              className="btn-primario"
              disabled={nombre.trim().length < 3 || telefono.replace(/\D/g, "").length < 7}
              onClick={avanzar}
            >
              Continuar
            </button>
            <button className="btn-secundario" onClick={retroceder}>
              Atrás
            </button>
          </div>
        </section>
      )}

      {/* PASO 4 — Revisión y consentimiento */}
      {paso === 4 && (
        <section>
          <h1 className="text-2xl font-bold sm:text-3xl">Revisa y envía</h1>

          <dl className="mt-6 divide-y divide-tinta/10 rounded-lg border-2 border-tinta/15 bg-white">
            {[
              ["Tema", areaElegida?.titulo],
              ["Tu caso", descripcion],
              ["Urgencia", URGENCIAS.find((u) => u.id === urgencia)?.label],
              ["Nombre", nombre],
              ["Celular", telefono],
              ["Correo", email || "No indicado"],
              ["Contacto por", CANALES.find((c) => c.id === canal)?.label],
              [
                "Ubicación",
                [municipio, departamento].filter(Boolean).join(", ") || "No indicada",
              ],
            ].map(([k, v]) => (
              <div key={k as string} className="px-4 py-3 sm:flex sm:gap-4">
                <dt className="text-sm font-semibold text-tinta/60 sm:w-32 sm:shrink-0">
                  {k}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap sm:mt-0">{v}</dd>
              </div>
            ))}
          </dl>

          <label className="mt-6 flex cursor-pointer gap-3 rounded-lg border-2 border-tinta/15 bg-white p-4">
            <input
              type="checkbox"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              className="mt-1 h-5 w-5 min-h-0 shrink-0 accent-acento"
            />
            <span className="text-sm leading-relaxed">
              Autorizo que mis datos personales se traten para asignarme un abogado
              voluntario y hacerle seguimiento a mi caso, conforme a la Ley 1581 de
              2012. Entiendo que mis datos se comparten únicamente con el abogado
              asignado y con el equipo de coordinación, y que puedo pedir su
              eliminación en cualquier momento.{" "}
              <a href="/privacidad" className="underline underline-offset-2">
                Ver política completa
              </a>
              .
            </span>
          </label>

          <div className="mt-4 rounded-lg bg-arena p-4 text-sm leading-relaxed text-tinta/70">
            Los abogados de esta plataforma se inscribieron de forma voluntaria.
            Antes de compartir documentos o información sensible, pídele el número
            de su tarjeta profesional y verifícalo en el registro del Consejo
            Superior de la Judicatura. Ningún abogado de Puente Legal puede pedirte
            dinero.
          </div>

          {error && (
            <div className="mt-4 rounded-lg border-2 border-alerta/30 bg-alerta/5 p-4 text-alerta">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              className="btn-primario"
              disabled={!consentimiento || enviando}
              onClick={enviar}
            >
              {enviando ? "Enviando…" : "Enviar mi caso"}
            </button>
            <button className="btn-secundario" onClick={retroceder} disabled={enviando}>
              Atrás
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
