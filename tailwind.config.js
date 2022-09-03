/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%": { opacity: 0, transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
          "100%": { opacity: 1, transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
  variants: {
    backgroundColor: ["hover", "focus", "responsive", "active"],
    fontSize: ["responsive", "hover"],
  },
};
