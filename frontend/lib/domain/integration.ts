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

export type BranchCredentialDto = {
  appId: string;
  branchKey: string;
  branchSecret: string;
};

export type BranchCredential = {
  app_id: string;
  branch_key: string;
  branch_secret: string;
};

export type UploadProgress = {
  progress: number;
  isCompleted: boolean;
};

export enum CredentialType {
  OAUTH = 'OAUTH',
  API_KEY = 'API_KEY',
  MYSQL = 'MYSQL',
  MSSQL = 'MSSQL',
  CSV = 'CSV',
  BRANCH = 'BRANCH',
  TATA_IVR = 'TATA_IVR',
}

export type MsSQLCredential = {
  server: string;
  port: string;
  username: string;
  password: string;
  databases: string[];
  over_ssh: boolean;
  ssh_credential?: DatabaseSSHCredential;
};

export type MySQLCredential = {
  host: string;
  port: string;
  username: string;
  password: string;
  databases: string[];
  over_ssh: boolean;
  ssh_credential?: DatabaseSSHCredential;
};

export type CSVCredential = {
  name: string;
  s3_key: string;
  table_name: string;
};

export type Credential = {
  type: CredentialType;
  account_id?: string;
  refresh_token?: string;
  api_key?: string;
  secret?: string;
  tableName?: string;
  mysql_credential?: MySQLCredential;
  mssql_credential?: MsSQLCredential;
  csv_credential?: CSVCredential;
  api_base_url?: string;
  branch_credential?: BranchCredential;
  tata_ivr_token?: string;
};
