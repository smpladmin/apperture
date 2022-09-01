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

  Modal:{
    baseStyle: {
           dialog: {
               maxHeight: "calc(100vh - 50px)",
               overflowY: "auto",
           }
       }
   },
});
