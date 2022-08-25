/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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

    extend: {
      spacing: {
        '25': '6.25rem',
        '30': '7.5rem',
        '33': '8.25rem',
        '45': '11.25rem',
      },
      maxWidth: {
        '16': "4rem",
      },
      fontSize: {
        "xs-8": ["0.5rem", "1.5"],
        "xs-10": ["0.625rem", "1.2"],
        "xs-14": ["0.875rem", "1.3"],
      },
    },
  },
  plugins: [],
};
