import { replacePlaceholderWithEmptyStringInExternalSegmentFilter } from './../utils/common';
import { replacePlaceholderWithEmptyString } from './../../components/Retention/utils';
import { Granularity } from '@lib/domain/retention';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';
import { DateFilterObj, ExternalSegmentFilter } from '@lib/domain/common';
import { FunnelStep } from '@lib/domain/funnel';
import { isValidSegmentFilter } from '@lib/utils/common';
import { cloneDeep } from 'lodash';

type RetentionRequestBody = {
  datasourceId: string;
  name?: string;
  startEvent: FunnelStep;
  goalEvent: FunnelStep;
  dateFilter: DateFilterObj;
  granularity: Granularity;
  segmentFilter?: ExternalSegmentFilter[];
};

export const getTransientTrendsData = async (
  dsId: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  interval: number,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const retentionRequestBody: RetentionRequestBody = {
    datasourceId: dsId,
    startEvent: replacePlaceholderWithEmptyString(cloneDeep(startEvent)),
    goalEvent: replacePlaceholderWithEmptyString(cloneDeep(goalEvent)),
    dateFilter,
    granularity,
  };

  if (segmentFilters && isValidSegmentFilter(segmentFilters)) {
    const updatedSegmentFilters =
      replacePlaceholderWithEmptyStringInExternalSegmentFilter(
        cloneDeep(segmentFilters)
      );

    retentionRequestBody.segmentFilter = updatedSegmentFilters;
  }
  const res = await ApperturePost(
    `/retention/trends/transient?interval=${interval}`,
    retentionRequestBody
  );
  return res.data || [];
};

export const getTransientRetentionData = async (
  dsId: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  page_number: number,
  page_size: number = 10,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const retentionRequestBody: RetentionRequestBody = {
    datasourceId: dsId,
    startEvent: replacePlaceholderWithEmptyString(cloneDeep(startEvent)),
    goalEvent: replacePlaceholderWithEmptyString(cloneDeep(goalEvent)),
    dateFilter,
    granularity,
  };

  if (segmentFilters && isValidSegmentFilter(segmentFilters)) {
    const updatedSegmentFilters =
      replacePlaceholderWithEmptyStringInExternalSegmentFilter(
        cloneDeep(segmentFilters)
      );

    retentionRequestBody.segmentFilter = updatedSegmentFilters;
  }
  const res = await ApperturePost(
    `/retention/transient?page_number=${page_number}&page_size=${page_size}`,
    retentionRequestBody
  );
  return res.data || { count: 0, data: [] };
};

export const getSavedRetentionsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/retention?datasource_id=${dsId}`);
  return res.data;
};

export const deleteRetention = async (id: string, dsId: string) => {
  return await AppertureDelete(`/retention/${id}`);
};

export const _getSavedRetention = async (
  token: string,
  retentionId: string
) => {
  const res = await ApperturePrivateGet(`/retention/${retentionId}`, token);
  return res.data;
};

export const saveRetention = async (
  dsId: string,
  retentionName: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  segmentFilters: ExternalSegmentFilter[]
) => {
  const retentionRequestBody: RetentionRequestBody = {
    datasourceId: dsId,
    name: retentionName,
    startEvent: replacePlaceholderWithEmptyString(cloneDeep(startEvent)),
    goalEvent: replacePlaceholderWithEmptyString(cloneDeep(goalEvent)),
    dateFilter,
    granularity,
  };

  if (segmentFilters && isValidSegmentFilter(segmentFilters)) {
    const updatedSegmentFilters =
      replacePlaceholderWithEmptyStringInExternalSegmentFilter(
        cloneDeep(segmentFilters)
      );

    retentionRequestBody.segmentFilter = updatedSegmentFilters;
  }

  const res = await ApperturePost('/retention', retentionRequestBody);
  return res;
};

export const updateRetention = async (
  retentionId: string,
  dsId: string,
  retentionName: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  segmentFilters: ExternalSegmentFilter[]
) => {
  const retentionRequestBody: RetentionRequestBody = {
    datasourceId: dsId,
    name: retentionName,
    startEvent: replacePlaceholderWithEmptyString(cloneDeep(startEvent)),
    goalEvent: replacePlaceholderWithEmptyString(cloneDeep(goalEvent)),
    dateFilter,
    granularity,
  };

  if (segmentFilters && isValidSegmentFilter(segmentFilters)) {
    const updatedSegmentFilters =
      replacePlaceholderWithEmptyStringInExternalSegmentFilter(
        cloneDeep(segmentFilters)
      );

    retentionRequestBody.segmentFilter = updatedSegmentFilters;
  }

  const res = await ApperturePut(
    `/retention/${retentionId}`,
    retentionRequestBody
  );
  return res;
};
