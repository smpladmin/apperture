import '../styles/globals.css';
import { AppContext, AppLayoutProps } from 'next/app';
import { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme/chakra.theme';
import { AppertureContext } from '@lib/contexts/appertureContext';
import mobile from 'is-mobile';
import { Device } from '@lib/types';
import 'userAnalytics';
import { MotionConfig } from 'framer-motion';
import isValidProp from '@emotion/is-prop-valid';

type CustomAppProps = {
  device: Device;
};

console.log(
  process.env.BACKEND_BASE_URL,
  process.env.JWT_SECRET,
  process.env.PUBLIC_BACKEND_BASE_URL,
  process.env.PUBLIC_FRONTEND_BASE_URL,
  process.env.PUBLIC_AMPLITUDE_API_KEY
);

function AppertureApp({
  Component,
  pageProps,
  device,
}: AppLayoutProps & CustomAppProps) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);

  return (
    <AppertureContext.Provider value={{ device }}>
      <MotionConfig isValidProp={isValidProp}>
        <ChakraProvider theme={theme}>
          {getLayout(<Component {...pageProps} />, pageProps?.apps)}
        </ChakraProvider>
      </MotionConfig>
    </AppertureContext.Provider>
  );
}

AppertureApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return {
    pageProps,
    device: { isMobile: mobile({ ua: ctx.req }) },
  };
};

export default AppertureApp;
