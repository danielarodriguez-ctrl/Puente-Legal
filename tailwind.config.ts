import type { Config } from "tailwindcss";

// Paleta de marca
//   #E52320  rojo    · identidad, botones, encabezados
//   #E26409  naranja · alertas y urgencias
//   negro              · textos
//
// Los tonos "Oscuro" existen por contraste: el rojo y el naranja de marca
// no alcanzan la relación 4.5:1 exigida cuando se usan como texto sobre
// fondo claro. Como relleno con texto blanco encima sí cumplen, así que
// la marca se ve intacta en banners y botones.

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: "#111111",         // texto
        arena: "#FAFAFA",         // fondo
        acento: "#E52320",        // rojo de marca (relleno)
        acentoOscuro: "#B81C19",  // rojo para texto y hover  · 6.25:1
        alerta: "#E26409",        // naranja de marca (relleno)
        alertaOscuro: "#BD5407",  // naranja para texto       · 4.54:1
      },
      fontFamily: {
        sans: [
          "Montserrat",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
