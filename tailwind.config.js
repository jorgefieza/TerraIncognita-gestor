// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ===== ADIÇÃO IMPORTANTE AQUI =====
  // A "safelist" diz ao Tailwind para NUNCA apagar estas classes,
  // mesmo que ele não as encontre escritas diretamente.
  safelist: [
    'blink-slow',
    'blink-fast',
  ],
  // ===================================
  theme: {
    extend: {},
  },
  plugins: [],
}