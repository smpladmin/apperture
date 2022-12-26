import { property } from 'lodash';
export type WhereSegmentFilter = {
  operand: string;
  operator: SegmentFilterOperators;
  values: string[];
  type: FilterType;
};

export type WhoSegmentFilter = {
  triggered: boolean;
  operand: string;
  aggregation: string;
  operator: SegmentFilterOperators;
  values: string[];
  start_date: Date;
  end_date: Date;
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
