import { SanityData } from './../domain/eventData';
import { AppertureGet, ApperturePrivateGet } from './util';
import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { Node } from '@lib/domain/node';
import { AxiosError } from 'axios';

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
  const res = await ApperturePrivateGet(`/datasources/${dsId}/nodes`, token);
  return res.data;
};

export const getNodes = async (dsId: string): Promise<Node[]> => {
  const res = await AppertureGet(`/datasources/${dsId}/nodes`);
  return res.data;
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

export const getEventProperties = async (dsId: string): Promise<string[]> => {
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

export const getEvents = async (
  dsId: string,
  isAux: boolean,
  tableName: string
): Promise<SanityData> => {
  const result = await AppertureGet(
    `/datasources/${dsId}/events?is_aux=${isAux}&table_name=${tableName}`
  );
  return result.data;
};
