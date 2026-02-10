/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#86BC25",
          light: "#A0D44B",
          dark: "#6B9B1E",
        },
        secondary: {
          DEFAULT: "#53565A",
          light: "#75787B",
          dark: "#3D3F42",
        },
      },
    },
  },
  plugins: [],
};
