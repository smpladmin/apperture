import { AppertureAPI } from '@lib/apiClient';
import { Provider } from '@lib/domain/provider';

export const createIntegrationWithDataSource = async (
  appId: string,
  provider: Provider,
  accountId: string,
  apiKey: string,
  apiSecret: string
) => {
  const res = await AppertureAPI.post(
    '/integrations',
    {
      appId,
      provider,
      accountId,
      apiKey,
      apiSecret,
    },
    { params: { create_datasource: true } }
  );
  return res.data;
};
