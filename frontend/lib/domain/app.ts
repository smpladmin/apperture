import { IntegrationWithDataSources } from './integration';

export type App = {
  _id: string;
  name: string;
};

export type AppWithIntegrations = App & {
  shared: boolean;
  integrations: Array<IntegrationWithDataSources>;
};
