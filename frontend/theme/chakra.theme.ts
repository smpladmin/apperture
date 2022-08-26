import { extendTheme } from '@chakra-ui/react';
import { colors, spacing } from './index';

// example theme
export const theme = extendTheme({
  colors: { ...colors },
  space: { ...spacing },
  sizes: { ...spacing },
  fonts: {
    body: 'Work Sans, sans-serif',
  },
});
