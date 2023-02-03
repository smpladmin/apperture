import { AppertureUser } from './user';

export type MetricEventFilter = {
  operand: string;
  operator: string;
  values: string[];
};

export enum MetricComponentVariant {
  EVENT = 'event',
  SEGMENT = 'segment',
  UNDEFINED = '',
}

export type MetricComponentAggregation = {
  functions: string;
  property: string;
};

export type EventOrSegmentComponent = {
  variable: string;
  reference_id: string;
  function: string;
  variant: MetricComponentVariant;
  filters: MetricEventFilter[];
  conditions: string[];
  aggregations: MetricComponentAggregation;
};
export type ComputedMetricData = {
  date: string;
  value: number;
  series: string;
};
export type ComputedMetric = {
  data: ComputedMetricData[];
  definition: string;
  average: any;
};
export type MetricTrend = { date: string; value: number };

export enum DateFilterType {
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  CUSTOM = 'custom',
  UNSET = '',
}

export type DateRangeType = {
  startDate: Date;
  endDate: Date;
};

export type DatePickerRange = {
  startDate: Date;
  endDate: Date;
  key: string;
};

export type Metric = {
  _id: string;
  datasourceId: string;
  appId: string;
  user: AppertureUser;
  userId: string;
  name: string;
  function: string;
  aggregates: EventOrSegmentComponent[];
  breakdown: string[];
};
