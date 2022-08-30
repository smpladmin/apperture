import { extendTheme } from '@chakra-ui/react';
import { colors, fontSizes, spacing, lineHeights } from './index';

// example theme
export const theme = extendTheme({
  colors: { ...colors },
  space: { ...spacing },
  sizes: { ...spacing },
  fonts: {
    body: 'Work Sans, sans-serif',
  },
  fontSizes: {
    ...fontSizes,
  },
  lineHeights: {
    ...lineHeights,
  },
});
