/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: '#6366f1', // Indigo-500
        dark: '#0f0f12',
        darker: '#18181b',
      },
    },
  },
  plugins: [],
}
