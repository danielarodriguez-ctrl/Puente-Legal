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
        {/* Degradado de marca: naranja a la izquierda, rojo a la derecha.
            El texto va en blanco puro, sin transparencias: sobre el naranja
            cualquier opacidad lo vuelve ilegible al sol, que es como mucha
            gente va a abrir esto. */}
        <header className="bg-gradient-to-r from-alerta to-acento text-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            {/* En celular la bajada va debajo del nombre. Puestas en fila
                se parten a la mitad en pantallas de 360 px. */}
            <a
              href="/"
              className="leading-tight text-white focus-visible:ring-white focus-visible:ring-offset-0"
            >
              {/* 20 px en negrita: por encima de ese tamaño el blanco sobre
                  el naranja ya cumple el mínimo de contraste. */}
              <span className="block text-xl font-bold tracking-tight">
                Puente Legal
              </span>
              <span className="block text-xs sm:text-sm">Todos por Colombia</span>
            </a>
            <a
              href="/abogados"
              className="whitespace-nowrap text-sm font-semibold text-white underline decoration-2 underline-offset-4 focus-visible:ring-white focus-visible:ring-offset-0"
            >
              Quiero sumarme
            </a>
          </div>
        </header>

        <main className="flex-1">
          <Component {...pageProps} />
        </main>

        <footer className="border-t border-tinta/10 bg-white">
          <div className="mx-auto max-w-3xl space-y-3 px-5 py-8 text-sm text-tinta/60">
            <p>
             Puente Legal es una iniciativa de{" "}
              <strong className="font-semibold text-tinta/75">
                Legal Hackers Bogotá
              </strong>{" "}
              que conecta a personas afectadas por el terremoto con abogados que
              donan su tiempo. No cobramos nada, ni a la persona ni al abogado.
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
