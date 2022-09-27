import Analytics from 'analytics';
// @ts-ignore
import amplitudePlugin from '@analytics/amplitude';
import Router from 'next/router';

const plugins =
  process.env.NODE_ENV === 'development'
    ? []
    : [
        amplitudePlugin({
          apiKey: process.env.PUBLIC_AMPLITUDE_API_KEY,
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
