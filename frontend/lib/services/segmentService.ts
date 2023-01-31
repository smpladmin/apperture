import {
  ApperturePrivateGet,
  ApperturePost,
  AppertureGet,
  ApperturePut,
} from './util';
import { cloneDeep } from 'lodash';
import { replaceEmptyStringPlaceholder } from './../../components/Segments/util';
import { SegmentGroup } from '@lib/domain/segment';

export const computeSegment = async (
  dsId: string,
  groups: SegmentGroup[],
  columns: string[]
) => {
  const res = await ApperturePost('/segments/transient', {
    datasourceId: dsId,
    groups: replaceEmptyStringPlaceholder(cloneDeep(groups)),
    columns,
  });
  return res.data;
};

export const saveSegment = async (
  name: string,
  description: string,
  dsId: string,
  groups: SegmentGroup[],
  columns: string[]
) => {
  return await ApperturePost('/segments', {
    name,
    description,
    datasourceId: dsId,
    groups: replaceEmptyStringPlaceholder(cloneDeep(groups)),
    columns,
  });
};

export const updateSegment = async (
  segmentId: string,
  name: string,
  description: string,
  dsId: string,
  groups: SegmentGroup[],
  columns: string[]
) => {
  return await ApperturePut(`/segments/${segmentId}`, {
    name,
    description,
    datasourceId: dsId,
    groups: replaceEmptyStringPlaceholder(cloneDeep(groups)),
    columns,
  });
};

export const _getSavedSegment = async (token: string, segementId: string) => {
  const res = await ApperturePrivateGet(`/segments/${segementId}`, token);
  return res.data;
};

export const getSavedSegmentsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/segments?datasource_id=${dsId}`);
  return res.data;
};
