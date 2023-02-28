import { replaceEmptyStringPlaceholder } from '@components/Metric/util';
import { MetricAggregate } from '@lib/domain/metric';
import {
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';

type MetricRequestBody = {
  datasourceId: string;
  function: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
  startDate?: string;
  endDate?: string;
};

const formatDatalabel = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: MetricAggregate[],
  breakdown: string[],
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  const requestBody: MetricRequestBody = {
    datasourceId: dsId,
    function: functions,
    aggregates,
    breakdown,
  };
  if (startDate) {
    requestBody.startDate = formatDatalabel(startDate);
  }
  if (endDate) {
    requestBody.endDate = formatDatalabel(endDate);
  }
  const res = await ApperturePost('metrics/compute', requestBody);
  return res.data || [];
};

export const _getSavedMetric = async (token: string, metricId: string) => {
  const result = await ApperturePrivateGet('/metrics/' + metricId, token);
  return result.data;
};

export const saveMetric = async (
  name: string,
  dsId: string,
  definition: string,
  aggregates: MetricAggregate[],
  breakdown: string[]
) => {
  const result = await ApperturePost('/metrics', {
    datasourceId: dsId,
    name,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
  });
  return result.data;
};

export const updateMetric = async (
  metricId: string,
  name: string,
  dsId: string,
  definition: string,
  aggregates: MetricAggregate[],
  breakdown: string[]
) => {
  const result = await ApperturePut('/metrics/' + metricId, {
    datasourceId: dsId,
    name,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
  });
  return result.data;
};

export const getSavedMetricsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/metrics?datasource_id=${dsId}`);
  return res.data;
};
