export type TrendData = {
  node: string;
  startDate: Date;
  endDate: Date;
  date: Date;
  week: number;
  month: number;
  year: number;
  hits: number;
  users: number;
};

export type SankeyData = {
  node: string;
  currentEvent: string;
  previousEvent: string;
  hits: number;
  users: number;
  flow: FlowType;
  hitsPercentage: number;
  usersPercentage: number;
};

export type NodeSignificanceData = {
  node: string;
  nodeHits: number;
  totalHits: number;
};

export enum FlowType {
  INFLOW = 'inflow',
  OUTFLOW = 'outflow',
}

export type EventData = {
  trendsData: TrendData[];
  sankeyData: SankeyData[];
  nodeSignificanceData: NodeSignificanceData[];
};

export enum SanityDataSource {
  ALL = 'All',
  MIXPANEL = 'Mixpanel',
  BACKEND = 'Backend CRM',
  USERS = 'Users (Google Sheet)',
}

export type SanityData = {
  count: number;
  data: any[];
};
