import Analytics from 'analytics';
// @ts-ignore
import amplitudePlugin from '@analytics/amplitude';
import Router from 'next/router';
import getConfig from 'next/config';
const { publicRuntimeConfig: config } = getConfig();

const plugins =
  process.env.NODE_ENV === 'development'
    ? []
    : [
        amplitudePlugin({
          apiKey: config.PUBLIC_AMPLITUDE_API_KEY,
          options: {},
        }),
      ];

export const analytics = Analytics({
  app: 'apperture-app',
  plugins,
});

Router.events.on('routeChangeComplete', () => {
  analytics.page();
});
