import { AppertureGet } from './util';
import { ApperturePrivateAPI } from './../apiClient/client.server';
import { ConversionStatus, FunnelStep } from '@lib/domain/funnel';
import { AxiosError } from 'axios';
import { AppertureAPI } from '../apiClient';
import { replaceEmptyStringPlaceholder } from '@components/Funnel/util';
import cloneDeep from 'lodash/cloneDeep';

export const saveFunnel = async (
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean
) => {
  try {
    const res = await AppertureAPI.post('/funnels', {
      datasourceId: dsId,
      name: funnelName,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
      randomSequence,
    });
    return res;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {} as any;
  }
};

export const getTransientFunnelData = async (
  dsId: string,
  steps: FunnelStep[]
) => {
  try {
    const res = await AppertureAPI.post('/funnels/transient', {
      datasourceId: dsId,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const _getSavedFunnel = async (token: string, funnelId: string) => {
  try {
    const res = await ApperturePrivateAPI.get(`/funnels/${funnelId}`, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const updateFunnel = async (
  funnelId: string,
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean
) => {
  try {
    const res = await AppertureAPI.put(`/funnels/${funnelId}`, {
      datasourceId: dsId,
      name: funnelName,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
      randomSequence,
    });
    return res;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {} as any;
  }
};

export const getTransientTrendsData = async (
  dsId: string,
  steps: FunnelStep[]
) => {
  try {
    const res = await AppertureAPI.post('/funnels/trends/transient', {
      datasourceId: dsId,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getSavedFunnelsForUser = async () => {
  try {
    const res = await AppertureAPI.get(`/funnels`);
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getConversionData = async (
  dsId: string,
  steps: FunnelStep[],
  status: ConversionStatus
) => {
  try {
    const res = await AppertureAPI.post('/funnels/analytics/transient', {
      datasourceId: dsId,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
      status,
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getUserProperty = async (
  userId: string,
  dsId: string,
  event: string
) => {
  const response = await AppertureGet('/user/property', {
    params: {
      user_id: userId,
      datasource_id: dsId,
      event,
    },
  });
  return response.data;
};
