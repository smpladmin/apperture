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

export const _getNodes = async (token: string, dsId: string) => {
  try {
    const res = await ApperturePrivateAPI.get(`/datasources/${dsId}/nodes`, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getTrendsData = async (
  dsId: string,
  nodeId: string,
  trendType: string
) => {
  try {
    const res = await AppertureAPI.get(
      `/datasources/${dsId}/trends?node=${nodeId}&trend_type=${trendType}`
    );
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getSankeyData = async (dsId: string, nodeId: string) => {
  try {
    const res = await AppertureAPI.get(
      `/datasources/${dsId}/sankey?node=${nodeId}`
    );
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getNodeSignificanceData = async (dsId: string, nodeId: string) => {
  try {
    const res = await AppertureAPI.get(
      `/datasources/${dsId}/node_significance?node=${nodeId}`
    );
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getEventProperties = async (dsId: string) => {
  try {
    const res = await AppertureAPI.get(`/datasources/${dsId}/event_properties`);
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getEventPropertiesValue = async (
  dsId: string,
  eventProperty: string
) => {
  try {
    const res = await AppertureAPI.get(
      `/datasources/${dsId}/property_values?event_property=${eventProperty}`
    );
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
