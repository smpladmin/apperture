import { AppertureUser as User } from './user';
import { FunnelStep } from '@lib/domain/funnel';
import { DateFilterObj, ExternalSegmentFilter } from './common';

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

export type Retention = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  updatedAt: Date;
  startEvent: FunnelStep;
  goalEvent: FunnelStep;
  dateFilter: DateFilterObj;
  segmentFilter?: ExternalSegmentFilter[];
  granularity: Granularity;
};

export type RetentionWithUser = Retention & {
  user: User;
};
