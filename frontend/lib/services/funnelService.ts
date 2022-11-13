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
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
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
