import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Como la tienda de Tiendanube: botones gris topo (500 y 600 con contraste
        // suficiente para texto blanco) y el rosa empolvado de la franja de avisos.
        brand: {
          50: "#f8f5f3",
          100: "#efe9e5",
          200: "#e3d9d3",
          500: "#736c64",
          600: "#5c5650",
          700: "#46413c",
        },
        // Dorado de la corona y de "MODA FEMENINA" del logo
        gold: {
          400: "#d8b26c",
          500: "#c9a15a",
        },
        blush: {
          100: "#f6e9eb",
          200: "#efdadd",
        },
      },
    },
  },
  plugins: [],
};

export default config;
