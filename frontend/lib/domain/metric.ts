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
  variant: string;
  filters: MetricEventFilter[];
  conditions: string[];
  aggregations: MetricComponentAggregation;
};

export type Metric = {
  data: { date: string; value: number }[];
  definition: string;
};
