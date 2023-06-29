import { ConversionWindowObj } from './../domain/funnel';
import {
  AppertureGet,
  ApperturePrivateGet,
  ApperturePost,
  ApperturePut,
  AppertureDelete,
} from './util';
import { ConversionStatus, FunnelStep } from '@lib/domain/funnel';
import { replaceEmptyStringPlaceholder } from '@components/Funnel/util';
import cloneDeep from 'lodash/cloneDeep';
import { DateFilterObj, ExternalSegmentFilter } from '@lib/domain/common';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import {
  isValidSegmentFilter,
  replacePlaceholderWithEmptyStringInExternalSegmentFilter,
} from '@lib/utils/common';

type FunnelRequestBody = {
  name?: string;
  datasourceId: string;
  steps: FunnelStep[];
  dateFilter: DateFilterObj | null;
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
  segmentFilter?: ExternalSegmentFilter[];
};

const _addSegmentFilterToRequestBody = (
  segmentFilters: ExternalSegmentFilter[] | null,
  requestBody: FunnelRequestBody
) => {
  if (segmentFilters && isValidSegmentFilter(segmentFilters)) {
    const updatedSegmentFilters =
      replacePlaceholderWithEmptyStringInExternalSegmentFilter(
        cloneDeep(segmentFilters)
      );

    requestBody.segmentFilter = updatedSegmentFilters;
  }
};

export const saveFunnel = async (
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean,
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePost('/funnels', funnelRequestBody);
  return res;
};

export const updateFunnel = async (
  funnelId: string,
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean,
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePut(`/funnels/${funnelId}`, funnelRequestBody);
  return res;
};

export const _getSavedFunnel = async (token: string, funnelId: string) => {
  const res = await ApperturePrivateGet(`/funnels/${funnelId}`, token);
  return res.data;
};

export const getTransientFunnelData = async (
  dsId: string,
  steps: FunnelStep[],
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean,
  segmentFilters: ExternalSegmentFilter[] | null,
  signal?: AbortSignal
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePost('/funnels/transient', funnelRequestBody, {
    signal,
  });
  return res;
};

export const getTransientTrendsData = async (
  dsId: string,
  steps: FunnelStep[],
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean,
  segmentFilters: ExternalSegmentFilter[] | null,
  signal?: AbortSignal
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePost(
    '/funnels/trends/transient',
    funnelRequestBody,
    { signal }
  );
  return res;
};

export const getSavedFunnelsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/funnels?datasource_id=${dsId}`);
  return res.data;
};

export const getSavedFunnelsForApp = async (appId: string) => {
  const res = await AppertureGet(`/funnels?app_id=${appId}`);
  return res.data || [];
};

export const getConversionData = async (
  dsId: string,
  steps: FunnelStep[],
  status: ConversionStatus,
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const funnelRequestBody = {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    status,
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePost(
    '/funnels/analytics/transient',
    funnelRequestBody
  );
  return res.data || [];
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

export const deleteFunnel = async (id: string, dsId: string) => {
  return await AppertureDelete(`/funnels/${id}?datasource_id=${dsId}`);
};

export const _getSavedFunnelPrivate = async (
  apiKey: string,
  funnelId: string
) => {
  const res = await ApperturePrivateAPI.get(`/private/funnels/${funnelId}`, {
    headers: { 'apperture-api-key': apiKey },
  });
  return res.data;
};

export const _getTransientTrendsDataPrivate = async (
  apiKey: string,
  dsId: string,
  steps: FunnelStep[],
  dateFilter: DateFilterObj | null,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean,
  segmentFilters: ExternalSegmentFilter[] | null
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

  _addSegmentFilterToRequestBody(segmentFilters, funnelRequestBody);

  const res = await ApperturePrivateAPI.post(
    `/private/funnels/trends/transient`,
    funnelRequestBody,
    {
      headers: { 'apperture-api-key': apiKey },
    }
  );
  return res.data || [];
};
