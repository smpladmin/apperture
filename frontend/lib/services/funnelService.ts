import { AxiosError } from 'axios';
import { AppertureAPI } from '../apiClient';

export const saveFunnel = async (
  dsId: string,
  funnelName: string,
  steps: any[],
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
