import Link from "next/link";

export default function Inicio() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Un abogado gratis para tu caso
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-tinta/75">
        Si el terremoto te afectó y tienes un problema legal, cuéntanos qué pasó.
        Te asignamos un abogado voluntario que te acompaña por teléfono o por
        WhatsApp, sin costo.
      </p>

      <Link href="/solicitar" className="btn-primario mt-8">
        Contar mi caso
      </Link>

      <p className="mt-3 text-sm text-tinta/55">
        Toma unos 4 minutos. No necesitas crear una cuenta.
      </p>

      <div className="mt-12 border-t border-tinta/10 pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-tinta/50">
          Cómo funciona
        </h2>
        <ol className="mt-5 space-y-6">
          {[
            {
              t: "Eliges el tema",
              d: "Vivienda, seguros, ayudas del Estado, documentos perdidos, trabajo, familia y más.",
            },
            {
              t: "Cuentas qué pasó",
              d: "Con tus palabras. No tienes que usar términos jurídicos.",
            },
            {
              t: "Te asignamos un abogado",
              d: "El sistema elige al siguiente abogado disponible de ese tema. No hay que buscar ni escoger.",
            },
            {
              t: "El abogado te llama",
              d: "Dentro de las siguientes 48 horas, al número que nos dejes.",
            },
          ].map((p, i) => (
            <li key={p.t} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-acento text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold">{p.t}</div>
                <div className="mt-0.5 text-tinta/70">{p.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-12 rounded-lg border-2 border-alerta/25 bg-alerta/5 p-5">
        <h2 className="font-semibold text-alerta">Si hay una emergencia ahora</h2>
        <p className="mt-2 text-tinta/80">
          Esta plataforma no atiende emergencias. Si hay riesgo para la vida,
          llama al <strong>123</strong>. Para reportar una persona desaparecida,
          la línea de la Cruz Roja Colombiana es el <strong>132</strong>.
        </p>
      </div>
    </div>
  );
}
