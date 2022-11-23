export type FunnelStep = {
  event: string;
  filters: Array<any>;
};

export type FunnelData = {
  event: string;
  users: number;
  conversion: number;
};

export type ComputedFunnel = {
  datasourceId: string;
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
