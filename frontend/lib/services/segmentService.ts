import { cloneDeep } from 'lodash';
import { replaceEmptyStringPlaceholder } from './../../components/Segments/util';
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
      groups: replaceEmptyStringPlaceholder(cloneDeep(groups)),
      columns,
      groupConditions: [],
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
