import {
  isValidMetricSegmentFilter,
  replaceEmptyStringPlaceholder,
} from '@components/Metric/util';
import { DateFilterObj } from '@lib/domain/common';
import { MetricAggregate, MetricSegmentFilter } from '@lib/domain/metric';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';

type MetricRequestBody = {
  name?: string;
  datasourceId: string;
  function: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
  dateFilter?: DateFilterObj;
  segmentFilter?: MetricSegmentFilter[];
};

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: MetricAggregate[],
  breakdown: string[],
  dateFilter: DateFilterObj,
  segmentFilters: MetricSegmentFilter[] | null,
  signal?: AbortSignal
) => {
  const requestBody: MetricRequestBody = {
    datasourceId: dsId,
    function: functions,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  };

  if (segmentFilters && isValidMetricSegmentFilter(segmentFilters)) {
    requestBody.segmentFilter = segmentFilters;
  }

  const res = await ApperturePost('metrics/compute', requestBody, { signal });
  return res;
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
  breakdown: string[],
  dateFilter: DateFilterObj,
  segmentFilters: MetricSegmentFilter[]
) => {
  const requestBody: MetricRequestBody = {
    name,
    datasourceId: dsId,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  };

  if (segmentFilters && isValidMetricSegmentFilter(segmentFilters)) {
    requestBody.segmentFilter = segmentFilters;
  }

  const result = await ApperturePost('/metrics', requestBody);
  return result;
};

export const updateMetric = async (
  metricId: string,
  name: string,
  dsId: string,
  definition: string,
  aggregates: MetricAggregate[],
  breakdown: string[],
  dateFilter: DateFilterObj,
  segmentFilters: MetricSegmentFilter[]
) => {
  const requestBody: MetricRequestBody = {
    name,
    datasourceId: dsId,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  };

  if (segmentFilters && isValidMetricSegmentFilter(segmentFilters)) {
    requestBody.segmentFilter = segmentFilters;
  }

  const result = await ApperturePut('/metrics/' + metricId, requestBody);
  return result;
};

export const getSavedMetricsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/metrics?datasource_id=${dsId}`);
  return res.data;
};

export const validateMetricFormula = async (
  formula: string,
  variableList: string[]
) => {
  const res = await ApperturePost(`/metrics/validate_formula`, {
    formula: formula,
    variableList: variableList,
  });
  return res.data;
};

export const deleteMetric = async (id: string, dsId: string) => {
  return await AppertureDelete(`/metrics/${id}?datasource_id=${dsId}`);
};
