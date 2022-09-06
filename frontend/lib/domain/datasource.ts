import { Provider } from './provider';

enum DataSourceVersion {
  V3 = 'V3',
  V4 = 'V4',
  DEFAULT = 'DEFAULT',
}

export type ProviderDataSource = {
  _id: string;
  name: string;
  version: DataSourceVersion;
  provider: Provider;
};
