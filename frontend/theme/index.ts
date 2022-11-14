const WHITE_DEFAULT = '#ffffff';
const PURPLE = '#7A4AA4';
const WHITE_100 = '#f6f6f6';
const WHITE_300 = '#efefef';
const BLACK_200 = '#0E0E19';
const NUCLEUS_TEAL = '#66A7BD';
const SHADOW_TEAL = '#66A7BD';
const EDGE_GRAY = '#E7EDF2';
const EDGE_ARROW_GRAY = '#a9a9aa';
const EDGE_LABEL_GRAY = '#808080';
const ARROW_GRAY = '#78787E';
const BLACK = '#000000';
const TEAL_100 = '#BDE6F1';
const YELLOW_100 = '#FFD98A';
const YELLOW_200 = '#FABC41';
const BLUE = '#6BBDF9';
const OVERLAY_GRAY = 'rgba(0, 0, 0, 0.6)';
const GREEN = '#57AA64';
const BLACK_RUSSIAN = '#181822';
const BASTILLE = '#282836';

const colors = {
  black: {
    DEFAULT: '#07070d',
    0: 'rgba(14,14,26,0)',
    10: 'rgba(255, 255, 255, 0.04)',
    20: 'rgba(255, 255, 255, 0.05)',
    30: 'rgba(255, 255, 255, 0.06)',
    50: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #0E0E19',
    100: '#0e0e1a',
    150: '#0E0E19',
    200: BLACK_200,
    300: BLACK_RUSSIAN,
  },
  white: {
    DEFAULT: WHITE_DEFAULT,
    0: 'rgba(255,255,255,0.08)',
    100: WHITE_100,
    200: '#ededed',
    300: WHITE_300,
  },
  grey: {
    DEFAULT: '#d9d9da',
    0: 'rgba(14, 14, 26, 0.6)',
    10: 'rgba(255, 255, 255, 0.2)',
    50: '#e5e5e5',
    100: '#b2b2b5',
    200: '#78787E',
    300: '#3E3E47',
  },
  yellow: '#fac213',
  green: GREEN,
  'hover-grey': '#78787e',
  teal: {
    100: TEAL_100,
  },
  radioBlack: {
    500: '#0e0e1a',
  },
};

const spacing = {
  0.15: '0.0375rem',
  11: '2.75rem',
  13: '3.25rem',
  15: '3.75rem',
  17: '4.25rem',
  18: '4.5rem',
  22: '5.5rem',
  25: '6.25rem',
  30: '7.5rem',
  33: '8.25rem',
  37: '9.25rem',
  39: '9.75rem',
  45: '11.25rem',
  50: '12.5rem',
  55: '13.75rem',
  62: '15.5rem',
  70: '17.5rem',
  75: '18.75rem',
  78: '19.5rem',
  82: '20.5rem',
  88: '22rem',
  100: '25rem',
  102: '25.5rem',
  106: '26.5rem',
  112: '28rem',
  125: '31.25rem',
  141: '35.25rem',
  150: '37.5rem',
  168: '42rem',
  176: '44rem',
  200: '50rem',
  320: '80rem',
};

const maxWidth = {
  16: '4rem',
};

const fontSizes = {
  'xs-8': '0.5rem', // fs-8px
  'xs-10': '0.625rem', // fs-10px
  'xs-12': '0.75rem', // fs-12px
  'xs-14': '0.875rem', // fs-14px
  base: '1rem', // fs-16px
  'sh-18': '1.125rem', // fs-18px
  'sh-20': '1.25rem', // fs-20px
  'sh-24': '1.5rem', // fs-24px
  'sh-28': '1.75rem', //fs-28px
  'sh-32': '2rem', // fs-32px
  'sh-34': '2.125rem', //fs-34px
  'sh-56': '3.5rem', //fs-56px
};

const lineHeights = {
  'xs-8': '0.75rem', // lh-12px,
  'xs-10': '0.75rem', // lh-12px,
  'xs-12': '1rem', // lh-16px,
  'xs-14': '1.125rem', // lh-18px,
  base: '1.375rem', // lh-22px,
  'sh-18': '1.375rem', //lh-22px,
  'sh-20': '1.5rem', //lh-24px,
  'sh-24': '1.75rem', //lh-28px,
  'sh-28': '2.215rem', //lh-34px
  'sh-32': '2.5rem', // lh-40px
  'sh-34': '2.625rem', //lh-42px
  'sh-56': '4.125rem', //lh-66px
};

const boxShadow = {
  xs: '0 1px 0 rgba(30, 25, 34, 0.08)',
};

export {
  colors,
  spacing,
  maxWidth,
  boxShadow,
  fontSizes,
  lineHeights,
  WHITE_DEFAULT,
  WHITE_300,
  PURPLE,
  BLACK_200,
  NUCLEUS_TEAL,
  SHADOW_TEAL,
  EDGE_GRAY,
  ARROW_GRAY,
  BLACK,
  WHITE_100,
  TEAL_100,
  EDGE_LABEL_GRAY,
  EDGE_ARROW_GRAY,
  YELLOW_100,
  YELLOW_200,
  BLUE,
  OVERLAY_GRAY,
  GREEN,
  BLACK_RUSSIAN,
  BASTILLE,
};
