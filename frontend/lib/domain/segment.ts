export type SegmentFilter = {
  operand: string;
  operator: string;
  values: string[];
};

export enum SegmentFilterConditions {
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
}

export type SegmentGroup = {
  filters: SegmentFilter[];
  conditions: SegmentFilterConditions[];
};

export type SegmentTableData = {
  count: number;
  data: any[];
};

export type Segment = {
  appId: string;
  columns: string[];
  createdAt: Date;
  datasourceId: string;
  description: string;
  groupConditions: any[];
  groups: SegmentGroup[];
  name: string;
  updatedAt: Date;
  userId: string;
  _id: string;
};
