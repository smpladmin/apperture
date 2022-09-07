import { extendTheme } from '@chakra-ui/react';
import { colors, fontSizes, spacing, lineHeights } from './index';

export const theme = extendTheme({
  colors: { ...colors },
  space: { ...spacing },
  sizes: { ...spacing },
  fonts: {
    body: `'Work Sans', sans-serif`,
    heading: `'Work Sans', sans-serif`,
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
      },
    },
  },
});
