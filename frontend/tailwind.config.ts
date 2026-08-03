/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kar: {
          green: "#065f46",       # Deep Karnataka Emerald Green
          greenlight: "#047857",
          saffron: "#ea580c",     # Saffron accents
          saffronlight: "#f97316",
          gold: "#d97706",
          dark: "#0f172a",
          cardBg: "#ffffff",
        }
      }
    },
  },
  plugins: [],
}
