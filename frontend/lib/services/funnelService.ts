import {
  AppertureGet,
  ApperturePrivateGet,
  ApperturePost,
  ApperturePut,
} from './util';
import {
  ConversionStatus,
  DateFilter,
  DateFilterType,
  FunnelStep,
} from '@lib/domain/funnel';
import { replaceEmptyStringPlaceholder } from '@components/Funnel/util';
import cloneDeep from 'lodash/cloneDeep';

type FunnelRequestBody = {
  datasourceId: string;
  name: string;
  steps: FunnelStep[];
  randomSequence: boolean;
  dateFilter?: DateFilter | null;
  dateFilterType?: DateFilterType | null;
};

export const saveFunnel = async (
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean,
  dateFilter: DateFilter | null,
  dateFilterType: DateFilterType | null
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
  };

  if (dateFilter && dateFilterType) {
    funnelRequestBody.dateFilter = dateFilter;
    funnelRequestBody.dateFilterType = dateFilterType;
  }

  const res = await ApperturePost('/funnels', funnelRequestBody);
  return res;
};

export const updateFunnel = async (
  funnelId: string,
  dsId: string,
  funnelName: string,
  steps: FunnelStep[],
  randomSequence: boolean,
  dateFilter: DateFilter | null,
  dateFilterType: DateFilterType | null
) => {
  const funnelRequestBody: FunnelRequestBody = {
    datasourceId: dsId,
    name: funnelName,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    randomSequence,
  };

  if (dateFilter && dateFilterType) {
    funnelRequestBody.dateFilter = dateFilter;
    funnelRequestBody.dateFilterType = dateFilterType;
  }

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
  dateFilter: DateFilter | null,
  dateFilterType: DateFilterType | null
) => {
  const res = await ApperturePost('/funnels/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    dateFilter,
    dateFilterType,
  });
  return res.data || [];
};

export const getTransientTrendsData = async (
  dsId: string,
  steps: FunnelStep[],
  dateFilter: DateFilter | null,
  dateFilterType: DateFilterType | null
) => {
  const res = await ApperturePost('/funnels/trends/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    dateFilter,
    dateFilterType,
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
  dateFilter: DateFilter | null,
  dateFilterType: DateFilterType | null
) => {
  const res = await ApperturePost('/funnels/analytics/transient', {
    datasourceId: dsId,
    steps: replaceEmptyStringPlaceholder(cloneDeep(steps)),
    status,
    dateFilter,
    dateFilterType,
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
