import { AppertureAPI } from '@lib/apiClient';
import { SegmentGroup } from '@lib/domain/segment';
import { AxiosError } from 'axios';

export const computeSegment = async (
  dsId: string,
  groups: SegmentGroup[],
  columns: string[]
) => {
  try {
    const res = await AppertureAPI.post('/segments/transient', {
      datasourceId: dsId,
      groups,
      columns,
      groupConditions: [],
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
