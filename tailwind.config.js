/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7FB77E",
        soft: "#BFD8B8",
        bg: "#F4FAF3",
        accent: "#5C8D89",
        ink: "#1F2937",
      },
      fontFamily: {
        sans: ["Inter", "Prompt", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};
