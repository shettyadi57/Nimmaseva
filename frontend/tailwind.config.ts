/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        kar: {
          green: "#059669",
          greenlight: "#10b981",
          emeraldGlow: "#34d399",
          saffron: "#f59e0b",
          saffronlight: "#fbbf24",
          gold: "#d97706",
          dark: "#0b0f19",
          surface: "#111827",
          surfaceElevated: "#1f293d",
          border: "rgba(255, 255, 255, 0.08)",
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
