export type WhereSegmentFilter = {
  condition: SegmentFilterConditions;
  operand: string;
  operator: SegmentFilterOperators;
  values: string[];
  type: FilterType;
};

export type WhoSegmentFilter = {
  condition: SegmentFilterConditions;
  triggered: boolean;
  operand: string;
  aggregation: string;
  operator: SegmentFilterOperators;
  values: string[];
  startDate: string;
  endDate: string;
  type: FilterType;
};

export type SegmentFilter = WhereSegmentFilter | WhoSegmentFilter;

export enum SegmentFilterOperators {
  EQUALS = 'equals',
}

export enum FilterType {
  WHERE = 'where',
  WHO = 'who',
}

export type SegmentProperty = {
  id: string;
  type: string;
};

export enum FilterItemType {
  PROPERTY = 'property',
  EVENT = 'event',
}

export enum SegmentFilterConditions {
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
  WHO = 'who',
}

export type SegmentGroup = {
  filters: SegmentFilter[];
};

export enum SegmentGroupConditions {
  AND = 'and',
  OR = 'or',
}

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
