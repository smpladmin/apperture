import { replaceEmptyStringPlaceholder } from '@components/Metric/util';
import { DateFilterObj } from '@lib/domain/common';
import { MetricAggregate } from '@lib/domain/metric';
import {
  AppertureDelete,
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
  dateFilter?: DateFilterObj;
};

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: MetricAggregate[],
  breakdown: string[],
  dateFilter: DateFilterObj
) => {
  const requestBody: MetricRequestBody = {
    datasourceId: dsId,
    function: functions,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  };

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
  breakdown: string[],
  dateFilter: DateFilterObj
) => {
  const result = await ApperturePost('/metrics', {
    datasourceId: dsId,
    name,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  });
  return result;
};

export const updateMetric = async (
  metricId: string,
  name: string,
  dsId: string,
  definition: string,
  aggregates: MetricAggregate[],
  breakdown: string[],
  dateFilter: DateFilterObj
) => {
  const result = await ApperturePut('/metrics/' + metricId, {
    datasourceId: dsId,
    name,
    function: definition,
    aggregates: replaceEmptyStringPlaceholder(aggregates),
    breakdown,
    dateFilter,
  });
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
