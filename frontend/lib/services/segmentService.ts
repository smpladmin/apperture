import { cloneDeep } from 'lodash';
import { replaceEmptyStringPlaceholder } from './../../components/Segments/util';
import { AppertureAPI } from '@lib/apiClient';
import { SegmentGroup } from '@lib/domain/segment';
import { AxiosError } from 'axios';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';

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

export const saveSegment = async (
  name: string,
  description: string,
  dsId: string,
  groups: SegmentGroup[],
  columns: string[]
) => {
  try {
    const res = await AppertureAPI.post('/segments/', {
      name,
      description,
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

export const _getSavedSegment = async (token: string, segementId: string) => {
  try {
    const res = await ApperturePrivateAPI.get(`/segments/${segementId}`, {
      headers: { Authorization: token },
      params: { with_integrations: true },
    });
    return res.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return [];
  }
};
