import { FunnelStep } from '@lib/domain/funnel';

export type RetentionEvents = {
  startEvent: FunnelStep;
  goalEvent: FunnelStep;
};

export enum Granularity {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export enum TrendScale {
  ABSOLUTE = 'absolute',
  PERCENTAGE = 'percentage',
}

export type RetentionTrendsData = {
  granularity: Date;
  retentionRate: number;
  retainedUsers: number;
};

export type IntervalTabData = {
  name: string;
  value: number;
};

export type RetentionData = {
  count: number;
  data: IntervalTabData[];
};
