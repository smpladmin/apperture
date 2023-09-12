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

export enum RelationalDatabaseType {
  MYSQL = 'MYSQL',
  MSSQL = 'MSSQL',
}

export type DatabaseCredential = {
  host: string;
  port: string;
  username: string;
  password: string;
  overSsh: boolean;
  databaseType: RelationalDatabaseType;
  sshCredential?: DatabaseSSHCredential;
};

export type UploadProgress = {
  progress: number;
  isCompleted: boolean;
};
