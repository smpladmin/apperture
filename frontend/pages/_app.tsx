import '../styles/globals.css';
import { AppContext, AppLayoutProps } from 'next/app';
import { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme/chakra.theme';
import { AppertureContext } from '@lib/contexts/appertureContext';
import mobile from 'is-mobile';
import { Device } from '@lib/types';
import 'userAnalytics';

type CustomAppProps = {
  device: Device;
};
function AppertureApp({
  Component,
  pageProps,
  device,
}: AppLayoutProps & CustomAppProps) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);

  return (
    <AppertureContext.Provider value={{ device }}>
      <ChakraProvider theme={theme}>
        {getLayout(<Component {...pageProps} />, pageProps?.apps)}
      </ChakraProvider>
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
