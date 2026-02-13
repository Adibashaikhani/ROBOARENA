/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F6F9FF",
          card: "#FFFFFF",
          line: "#E6EEF9",
          text: "#0B1220",
          muted: "#60708A",
          blue: "#4DA3FF",
          blueSoft: "#EAF4FF",
          yellow: "#FFC93C",
          yellowSoft: "#FFF4D6",
        },

        // IMPORTANT: keep these at root so classes work: bg-brand-blueSoft
        "brand-blueSoft": "#E0F2FE",
        "brand-yellowSoft": "#FEF9C3",
        "brand-blue": "#38BDF8",
        "brand-yellow": "#FACC15",
        "brand-text": "#0F172A",
        "brand-line": "#E5E7EB",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(12, 35, 64, 0.08)",
        card: "0 8px 24px rgba(12, 35, 64, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
