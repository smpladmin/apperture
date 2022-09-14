import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { ProviderDataSource } from '@lib/domain/datasource';
import { AxiosError } from 'axios';

export const _getProviderDatasources = async (
  token: string,
  integrationId: string | undefined
) => {
  const res = await ApperturePrivateAPI.get(
    `/integrations/${integrationId}/datasources`,
    {
      headers: { Authorization: token },
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
  const res = await AppertureAPI.post(
    `/integrations/${integrationId}/datasources`,
    datasources,
    {
      params: { trigger_data_processor: true },
    }
  );
  return res.data;
};

export const _getEdges = async (token: string, dsId: string) => {
  try {
    const res = await ApperturePrivateAPI.get(`/datasources/${dsId}/edges`, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
