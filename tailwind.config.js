// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'blink-slow',
    'blink-fast',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}