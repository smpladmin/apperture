import { DataSource } from './datasource';
import { Provider } from './provider';

export type Integration = {
  _id: string;
  provider: Provider;
};

export type IntegrationWithDataSources = Integration & {
  datasources: Array<DataSource>;
};

export type DatabaseSSHCredential = {
  server: string;
  port: string;
  username?: string;
  password?: string;
  sshKey?: string;
};

export type MySQLCredential = {
  host: string;
  port: string;
  username: string;
  password: string;
  overSsh: boolean;
  sshCredential?: DatabaseSSHCredential;
};

export type UploadProgress = {
  progress: number;
  isCompleted: boolean;
};
