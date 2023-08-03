import '../styles/metric-tooltip.css';
import '../styles/globals.css';
import '../styles/funnel-tooltip.css';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import '../styles/daterange.css';
import '@silevis/reactgrid/styles.css';
import '../styles/spreadsheet.css';
import { AppContext, AppLayoutProps } from 'next/app';
import { ReactNode, useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '../theme/chakra.theme';
import { AppertureContext } from '@lib/contexts/appertureContext';
import MapContextProvider from '@lib/contexts/mapContext';
import mobile from 'is-mobile';
import { Device } from '@lib/types';
import 'userAnalytics';
import { MotionConfig } from 'framer-motion';
import isValidProp from '@emotion/is-prop-valid';
import { resetServerContext } from 'react-beautiful-dnd';
import NextNProgress from 'nextjs-progressbar';
import { GREY_400 } from '@theme/index';
import { useRouter } from 'next/router';
import { APPERTURE_PH_KEY, APPERTURE_EVENTS_URL } from 'config';
type CustomAppProps = {
  device: Device;
};

if (typeof window !== 'undefined' && window.posthog && APPERTURE_PH_KEY) {
  window.posthog.init(APPERTURE_PH_KEY, {
    api_host: APPERTURE_EVENTS_URL || 'http://events_consumer/events/capture',
    debug: process.env.NODE_ENV === 'development',
  });
}

function AppertureApp({
  Component,
  pageProps,
  device,
}: AppLayoutProps & CustomAppProps) {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () =>
      window.posthog.capture && window.posthog.capture('$pageview');
    const handleRouteChangeStart = () =>
      window.posthog.capture && window.posthog.capture('$pageleave');

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  return (
    <AppertureContext.Provider value={{ device }}>
      <MapContextProvider>
        <MotionConfig isValidProp={isValidProp}>
          <ChakraProvider theme={theme}>
            <NextNProgress color={GREY_400} />
            {getLayout(<Component {...pageProps} />, pageProps?.apps)}
          </ChakraProvider>
        </MotionConfig>
      </MapContextProvider>
    </AppertureContext.Provider>
  );
}

AppertureApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  resetServerContext();
  return {
    pageProps,
    device: { isMobile: mobile({ ua: ctx.req }) },
  };
};

export default AppertureApp;
