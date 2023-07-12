import { DatabaseCredential } from './../domain/integration';
import { AxiosRequestConfig } from 'axios';
import { ApperturePost, ApperturePrivateGet } from './util';
import { ProviderDataSource } from '@lib/domain/datasource';
import { Provider } from '@lib/domain/provider';

type IntegrationRequestBody = {
  appId: string;
  provider: Provider;
  accountId?: string;
  apiKey?: string;
  apiSecret?: string;
  databaseCredential?: DatabaseCredential;
};

export const createIntegrationWithDataSource = async (
  appId: string,
  provider: Provider,
  accountId?: string,
  apiKey?: string,
  apiSecret?: string,
  databaseCredential?: DatabaseCredential,
  config: AxiosRequestConfig = {
    params: {
      create_datasource: true,
      trigger_data_processor: !databaseCredential,
    },
  }
) => {
  const integrationRequestBody: IntegrationRequestBody = databaseCredential
    ? {
        appId,
        provider,
        databaseCredential,
      }
    : { appId, provider, accountId, apiKey, apiSecret };

  const res = await ApperturePost(
    '/integrations',
    integrationRequestBody,
    config
  );
  return res.data;
};

export const _getProviderDatasources = async (
  token: string,
  integrationId: string | undefined
) => {
  const res = await ApperturePrivateGet(
    `/integrations/${integrationId}/datasources`,
    token,
    {
      params: { from_provider: true },
    }
  );
  return res.data;
};

export const saveDataSources = async (
  selectedDataSources: Array<ProviderDataSource>,
  integrationId: string
) => {
  const datasources = selectedDataSources.map((ds) => {
    return {
      externalSourceId: ds._id,
      name: ds.name,
      version: ds.version,
    };
  });
  const res = await ApperturePost(
    `/integrations/${integrationId}/datasources`,
    datasources,
    {
      params: { trigger_data_processor: true },
    }
  );
  return res.data;
};

export const testDatabaseConnection = async (
  databaseCredential: DatabaseCredential
) => {
  const res = await ApperturePost(
    `/integrations/database/test`,
    databaseCredential
  );
  return res.data;
};
