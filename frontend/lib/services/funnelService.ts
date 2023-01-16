import { ApperturePrivateAPI } from './../apiClient/client.server';
import { FunnelStep } from '@lib/domain/funnel';
import { AxiosError } from 'axios';
import { AppertureAPI } from '../apiClient';

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
      steps,
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
      steps,
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const _getComputedFunnelData = async (
  token: string,
  funnelId: string
) => {
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

export const getComputedFunnelData = async (funnelId: string) => {
  try {
    const res = await AppertureAPI.get(`/funnels/${funnelId}`);
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
      steps,
      randomSequence,
    });
    return res;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {} as any;
  }
};

export const _getComputedTrendsData = async (
  token: string,
  funnelId: string
) => {
  try {
    const res = await ApperturePrivateAPI.get(`/funnels/${funnelId}/trends`, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getComputedTrendsData = async (funnelId: string) => {
  try {
    const res = await AppertureAPI.get(`/funnels/${funnelId}/trends`);
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};

export const getTransientTrendsData = async (
  dsId: string,
  steps: FunnelStep[]
) => {
  try {
    const res = await AppertureAPI.post('/funnels/trends/transient', {
      datasourceId: dsId,
      steps,
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

export const getConversionData = async (dsId: string, steps: FunnelStep[]) => {
  try {
    const res = await AppertureAPI.post('/funnels/analytics/transient', {
      datasourceId: dsId,
      steps,
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
  try {
    const res = await AppertureAPI.get('/user/property', {
      params: {
        user_id: userId,
        datasource_id: dsId,
        event,
      },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
