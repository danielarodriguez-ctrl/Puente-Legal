import type { AppProps } from "next/app";
import Head from "next/head";
// Montserrat servida desde el propio dominio. No hay petición a Google
// cuando alguien abre la página: importa cuando la gente entra con mala
// conexión desde una zona afectada.
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/montserrat/latin-700.css";
import "../globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Puente Legal — Ayuda jurídica gratuita para afectados por el terremoto</title>
        <meta
          name="description"
          content="Abogados voluntarios que acompañan gratis, por teléfono o virtual, a las personas afectadas por el terremoto en Colombia."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#E52320" />
      </Head>

      <div className="flex min-h-screen flex-col font-sans">
        <header className="border-b border-tinta/10 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <a href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight">Puente Legal</span>
              <span className="hidden text-sm text-tinta/50 sm:inline">
                Terremoto Colombia
              </span>
            </a>
            <a
              href="/abogados"
              className="text-sm font-semibold text-acentoOscuro underline underline-offset-4"
            >
              Soy abogado
            </a>
          </div>
        </header>

        <main className="flex-1">
          <Component {...pageProps} />
        </main>

        <footer className="border-t border-tinta/10 bg-white">
          <div className="mx-auto max-w-3xl space-y-3 px-5 py-8 text-sm text-tinta/60">
            <p>
              Puente Legal conecta a personas afectadas por el terremoto con abogados
              que donan su tiempo. No cobramos nada, ni a la persona ni al abogado.
            </p>
            <p>
              Este servicio ofrece orientación jurídica. No reemplaza la representación
              formal ante un juez ni constituye un contrato de mandato. Los abogados
              voluntarios responden a título personal.
            </p>
            <p>
              <a href="/privacidad" className="underline underline-offset-4">
                Tratamiento de datos personales
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
