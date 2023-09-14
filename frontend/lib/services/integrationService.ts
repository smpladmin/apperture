import { DatabaseCredential, UploadProgress } from '@lib/domain/integration';
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
  tableName?: string;
  databaseCredential?: DatabaseCredential;
  csvFileId?: string;
  eventList?: string[];
};

export const createIntegrationWithDataSource = async (
  appId: string,
  provider: Provider,
  accountId?: string,
  apiKey?: string,
  apiSecret?: string,
  tableName?: string,
  databaseCredential?: DatabaseCredential,
  csvFileId?: string,
  eventList?: string[],
  config: AxiosRequestConfig = {
    params: {
      create_datasource: true,
      trigger_data_processor: !(databaseCredential || csvFileId),
    },
  }
) => {
  const integrationRequestBody: IntegrationRequestBody =
    databaseCredential || csvFileId
      ? {
          appId,
          provider,
          databaseCredential,
          csvFileId,
        }
      : { appId, provider, accountId, apiKey, apiSecret, tableName, eventList };

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

export const uploadCSV = async (
  file: File,
  appId: string,
  onProgress?: (progress: UploadProgress) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('appId', appId);

  const res = await ApperturePost(`/integrations/csv/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.min(
        Math.round((progressEvent.loaded * 100) / progressEvent.total),
        99
      );
      if (onProgress) {
        onProgress({ progress, isCompleted: false });
      }
    },
  });
  if (onProgress) {
    onProgress({ progress: 100, isCompleted: true });
  }
  return res;
};

export const deleteCSV = async (filename: string) => {
  const res = await ApperturePost(`/integrations/csv/delete`, { filename });
};

export const createTableWithCSV = async (
  fileId: string,
  datasourceId: string
) => {
  const res = await ApperturePost(`/integrations/csv/create`, {
    fileId,
    datasourceId,
  });
  return res.status;
};
