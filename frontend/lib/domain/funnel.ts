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

export type Funnel = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  updatedAt: Date;
  user: User;
  steps: FunnelStep[];
  randomSequence: boolean;
};

export type FunnelTrendsData = {
  conversion: Number;
  startDate: Date;
  endDate: Date;
  firstStepUsers: Number;
  lastStepUsers: Number;
};

export type FunnelEventUserData = {
  id: string;
};

export type FunnelConversionData = {
  users: FunnelEventUserData[];
  total_users: number;
  unique_users: number;
};

export type FunnelEventConversion = {
  converted: FunnelConversionData;
  dropped: FunnelConversionData;
  step: number;
  event: string;
};

export type UserProperty = {
  Property: string;
  Value: string;
};
