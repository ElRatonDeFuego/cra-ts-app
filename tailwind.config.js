/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  variants: {
    backgroundColor: ["hover", "focus", "responsive", "active"],
    fontSize: ["responsive", "hover"],
  },
};
