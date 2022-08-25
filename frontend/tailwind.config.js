/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      black: {
        DEFAULT: '#07070d',
        100: '#0e0e1a'
      },
      white: '#ffffff',
      grey: '#d9d9da',
      yellow: '#fac213',
      green: '#57aa64',
      'hover-grey': '#78787e'
    },
    extend: {},
  },
  plugins: [],
}
