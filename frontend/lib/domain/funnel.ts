import { DateFilterObj, WhereFilter } from './common';
import { AppertureUser as User } from './user';

export type FunnelStep = {
  event: string;
  filters: WhereFilter[];
};

export enum FunnelFilterOperators {
  IS = 'is',
}

export type FunnelData = {
  step: number;
  event: string;
  users: number;
  conversion: number;
  conversionWrtPrevious: number;
  drop: number;
};

export type Funnel = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  updatedAt: Date;
  steps: FunnelStep[];
  randomSequence: boolean;
  dateFilter?: DateFilterObj;
  conversionWindow?: ConversionWindowObj;
};

export type FunnelWithUser = Funnel & {
  user: User;
};

export type FunnelTrendsData = {
  conversion: number;
  startDate: Date;
  endDate: Date;
  firstStepUsers: number;
  lastStepUsers: number;
};

export type FunnelEventUserData = {
  id: string;
};

export type FunnelConversionData = {
  users: FunnelEventUserData[];
  totalUsers: number;
  uniqueUsers: number;
};

export type FunnelEventConversion = {
  converted?: FunnelConversionData;
  dropped?: FunnelConversionData;
  step: number;
  event: string;
};

export type UserProperty = {
  Property: string;
  Value: string;
};

export enum ConversionStatus {
  CONVERTED = 'converted',
  DROPPED = 'dropped',
}

export enum ConversionWindowList {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export type ConversionWindowObj = {
  type: ConversionWindowList;
  value: number;
};
