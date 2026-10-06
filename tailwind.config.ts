import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Rosas: 500 y 600 tienen contraste suficiente con texto blanco (botones)
        brand: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          500: "#db2777",
          600: "#be185d",
          700: "#9d174d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
