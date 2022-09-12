export type ApiDataType = {
  previousPage: string;
  pagePath: string;
  users: number;
  id: number | string;
  createdAt: number;
  viewId: string;
};

export type EdgeType = {
  source: string;
  target: string;
  previousPage: string;
  pagePath: string;
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
  pageName: string;
  percentile?: number;
  visibleAt?: number;
  totalViews?: number;
};

export type ZoomConfigType = Array<{
  percentile: number;
  ratio: number;
}>;
