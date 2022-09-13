import { DataSource } from './datasource';
import { Provider } from './provider';

export type Integration = {
  _id: string;
  provider: Provider;
};

export type IntegrationWithDataSources = Integration & {
  datasources: Array<DataSource>;
};
