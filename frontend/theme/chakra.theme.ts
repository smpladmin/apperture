import { extendTheme } from '@chakra-ui/react';
import { colors, fontSizes, spacing, lineHeights } from './index';

export const theme = extendTheme({
  colors: { ...colors },
  space: { ...spacing },
  sizes: { ...spacing },
  fonts: {
    body: `'Inter', sans-serif`,
    heading: `'Inter', sans-serif`,
  },
  fontSizes: {
    ...fontSizes,
  },
  lineHeights: {
    ...lineHeights,
  },
  components: {
    Button: {
      variants: {
        primary: {
          _hover: {
            bg: 'black.50',
          },
          _disabled: {
            bg: 'grey.DEFAULT',
            pointerEvents: 'none',
          },
        },
        secondary: {
          _hover: {
            bg: 'grey.50',
          },
        },
        iconButton: {
          _hover: {
            bg: 'grey.200',
          },
        },
        dark: {
          bg: 'black.200',
          color: 'white',
        },
      },
    },
  },
});
