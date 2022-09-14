import { IntegrationWithDataSources } from './integration';

export type App = {
  _id: string;
  name: string;
};

export type AppWithIntegrations = App & {
  integrations: Array<IntegrationWithDataSources>;
};
