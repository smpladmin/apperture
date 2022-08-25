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
    backgroundColor: (theme) => ({
      ...theme("colors"),
      aptBlack: "#0E0E1A",
      aptGreen: "#57AA64",
    }),

    maxWidth: {
      4: "4rem",
    },

    fontSize: {
      "xs-8": ["0.5rem", "1.5"],
      "xs-10": ["0.625rem", "1.2"],
      "xs-14": ["0.875rem", "1.3"],
    },
    extend: {},
  },
  plugins: [],
};
