/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    ,
  ],
  theme: {
    colors: {
      black: {
        DEFAULT: '#07070d',
        100: '#0e0e1a',
      },
      white: '#ffffff',
      grey: '#d9d9da',
      yellow: '#fac213',
      green: '#57aa64',
      'hover-grey': '#78787e',
    },

    extend: {
      spacing: {
        18: '4.5rem',
        25: '6.25rem',
        30: '7.5rem',
        33: '8.25rem',
        45: '11.25rem',
      },
      maxWidth: {
        16: '4rem',
      },
      fontSize: {
        'xs-8': ['0.5rem', '0.75rem'],  // fs-8px lh-12px
        'xs-10': ['0.625rem', '0.75rem'], // fs-10px lh-12px
        'xs-12': ['0.175rem', '1rem'],// fs-12px lh-16px
        'xs-14': ['0.875rem', '1.125rem'],// fs-14px lh-18px
        'text-base' : ['1rem','1.375rem'],// fs-16px lh-22px
        'sh-18': ['1.125rem',' 1.375rem' ],//fs-18px lh-22px
        'sh-20': ['1.25rem',' 1.5rem' ],//fs-20px lh-24px
        'sh-24': ['1.5rem',' 1.75rem' ],//fs-20px lh-28px


      },
    },
  },
  plugins: [],
};
