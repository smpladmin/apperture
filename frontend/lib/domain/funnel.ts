export type FunnelStep = {
  event: string;
  filters: Array<any>;
};

export type FunnelData = {
  step: number;
  event: string;
  users: number;
  conversion: number;
  drop: number;
};

export type ComputedFunnel = {
  _id: string;
  datasourceId: string;
  appId: string;
  name: string;
  steps: FunnelStep[];
  randomSequence: boolean;
  computedFunnel: FunnelData[];
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
