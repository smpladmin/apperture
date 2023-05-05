import {
  DateFilterObj,
  ExternalSegmentFilter,
  GroupConditions,
  WhereFilter,
} from './common';
import { SegmentGroup } from './segment';
import { AppertureUser } from './user';

export enum MetricVariant {
  EVENT = 'event',
  SEGMENT = 'segment',
  UNDEFINED = '',
}

export type MetricComponentAggregation = {
  functions: MetricBasicAggregation | MetricAggregatePropertiesAggregation;
  property: string;
};

export type MetricAggregate = {
  variable: string;
  reference_id: string;
  function: string;
  variant: MetricVariant;
  filters: WhereFilter[];
  conditions: string[];
  aggregations: MetricComponentAggregation;
};
export type MetricTrendData = {
  date: string;
  value: number;
  series: string;
};

export type MetricBreakdown = {
  property: string;
  value: string;
};

export type MetricValue = { date: string; value: number };

export type ComputedMetricData = {
  breakdown: MetricBreakdown[];
  data: MetricValue[];
};

export type ComputedMetric = {
  name: string;
  series: ComputedMetricData[];
};

export type MetricTrend = { date: string; value: number };

export type MetricTableData = {
  name: string;
  propertyValue: string | undefined;
  average: string;
  values: { [key in string]: number };
};

export type Breakdown = {
  value: string;
  rowIndex: number;
};

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
  userId: string;
  name: string;
  function: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
  dateFilter?: DateFilterObj;
  segmentFilter?: ExternalSegmentFilter[];
};

export type MetricWithUser = Metric & {
  user: AppertureUser;
};

export enum MetricBasicAggregation {
  TOTAL = 'count',
  UNIQUE = 'unique',
}

export enum MetricAggregatePropertiesAggregation {
  SUM = 'ap_sum',
  AVERAGE = 'ap_average',
  MEDIAN = 'ap_median',
  'DISTINCT COUNT' = 'ap_distinct_count',
  MIN = 'ap_min',
  MAX = 'ap_max',
  '25th Percentile' = 'ap_p25',
  '75th Percentile' = 'ap_p75',
  '90th Percentile' = 'ap_p90',
  '99th Percentile' = 'ap_p99',
}
