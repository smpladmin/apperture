import { extendTheme } from '@chakra-ui/react';
import { colors, spacing } from './index';

export const theme = extendTheme({
  colors: { ...colors },
  space: { ...spacing },
  sizes: { ...spacing },
  fonts: {
    body: `'Work Sans', sans-serif`,
    heading: `'Work Sans', sans-serif`,
  },
});
