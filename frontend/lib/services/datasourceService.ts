import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { ProviderDataSource } from '@lib/domain/datasource';

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
  const res = await AppertureAPI.post(
    `/integrations/${integrationId}/datasources`,
    selectedDataSources
  );
  console.log(res.data);
  return res.data;
};
