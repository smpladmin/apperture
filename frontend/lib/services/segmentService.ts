import { AppertureAPI } from '@lib/apiClient';
import { SegmentFilter } from '@lib/domain/segment';
import { AxiosError } from 'axios';

export const computeSegment = async (
  dsId: string,
  filters: SegmentFilter[]
) => {
  try {
    const res = await AppertureAPI.post('/segments/transient', {
      datasourceId: dsId,
      filters,
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
