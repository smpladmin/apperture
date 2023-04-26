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
import { DateFilterObj } from '@lib/domain/common';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';

export const saveFunnel = async (
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean,
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj
) => {
  const funnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

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
  conversionWindow: ConversionWindowObj
) => {
  const funnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
    dateFilter,
    conversionWindow,
  };

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
  randomSequence: boolean
) => {
  const res = await ApperturePost('/funnels/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    dateFilter,
    conversionWindow,
    randomSequence,
  });
  return res.data || [];
};

export const getTransientTrendsData = async (
  dsId: string,
  steps: FunnelStep[],
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean
) => {
  const res = await ApperturePost('/funnels/trends/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    dateFilter,
    conversionWindow,
    randomSequence,
  });
  return res.data || [];
};

export const getSavedFunnelsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/funnels?datasource_id=${dsId}`);
  return res.data;
};

export const getConversionData = async (
  dsId: string,
  steps: FunnelStep[],
  status: ConversionStatus,
  dateFilter: DateFilterObj,
  conversionWindow: ConversionWindowObj,
  randomSequence: boolean
) => {
  const res = await ApperturePost('/funnels/analytics/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    status,
    dateFilter,
    conversionWindow,
    randomSequence,
  });
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
  conversionWindow: ConversionWindowObj | null,
  randomSequence: boolean
) => {
  const res = await ApperturePrivateAPI.post(
    `/private/funnels/trends/transient`,
    {
      datasourceId: dsId,
      steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
      dateFilter,
      conversionWindow,
      randomSequence,
    },
    {
      headers: { 'apperture-api-key': apiKey },
    }
  );
  return res.data || [];
};
