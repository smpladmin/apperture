export type ApiDataType = {
  previousEvent: string;
  currentEvent: string;
  users: number;
  _id: number | string;
};

export type EdgeType = {
  source: string;
  target: string;
  previousEvent: string;
  currentEvent: string;
  type: string;
  node1Label: number;
  traffic: number;
  percentile?: number;
  visibleAt?: number;
  node2Label?: number;
  isHiddenEdge?: boolean | false;
};

export type NodeType = {
  id: string;
  label: string;
  type: string;
  isHidden?: boolean;
  eventName: string;
  percentile?: number;
  visibleAt?: number;
  totalViews?: number;
};

export type ZoomConfigType = Array<{
  percentile: number;
  ratio: number;
}>;
