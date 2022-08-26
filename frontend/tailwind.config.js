/** @type {import('tailwindcss').Config} */
const {
  colors,
  spacing,
  maxWidth,
  fontSize,
  boxShadow,
} = require('./theme/index.js');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    ,
  ],
  theme: {
    colors: { ...colors },

    extend: {
      spacing: { ...spacing },
      maxWidth: { ...maxWidth },
      fontSize: { ...fontSize },
      boxShadow: { ...boxShadow },
    },
  },
  plugins: [],
};
