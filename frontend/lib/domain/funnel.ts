import { DateFilter, DateFilterType } from './common';
import { FilterType } from './segment';
import { AppertureUser as User } from './user';

export type FunnelStep = {
  event: string;
  filters: FunnelStepFilter[];
};

export type FunnelStepFilter = {
  condition: FunnelFilterConditions;
  operand: string;
  operator: FunnelFilterOperators;
  values: string[];
  all: boolean;
  type: FilterType;
  datatype: FunnelFilterDataType;
};

export enum FunnelFilterConditions {
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
}

export enum FunnelFilterDataType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOL = 'True/ False',
}

export enum FunnelFilterOperators {
  IS = 'is',
}

export type FunnelData = {
  step: number;
  event: string;
  users: number;
  conversion: number;
  drop: number;
};

export type FunnelDateFilter = {
  filter: DateFilter | null;
  type: DateFilterType | null;
};

export type Funnel = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  updatedAt: Date;
  steps: FunnelStep[];
  randomSequence: boolean;
  dateFilter?: FunnelDateFilter;
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
