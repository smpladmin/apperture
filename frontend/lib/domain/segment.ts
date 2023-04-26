import { DateFilter, DateFilterType, GroupConditions } from './common';
import { AppertureUser } from './user';

export type WhereSegmentFilter = {
  condition: SegmentFilterConditions;
  operand: string;
  operator: SegmentFilterOperators;
  values: string[];
  all: boolean;
  type: FilterType;
  datatype: SegmentFilterDataType;
};

export type WhoSegmentFilter = {
  condition: SegmentFilterConditions;
  triggered: boolean;
  operand: string;
  aggregation: string;
  operator: SegmentFilterOperatorsNumber;
  values: string[];
  date_filter: DateFilter;
  date_filter_type: DateFilterType;
  type: FilterType;
  datatype: SegmentFilterDataType;
};

export type SegmentFilter = WhereSegmentFilter | WhoSegmentFilter;

export type SegmentFilterOperators =
  | SegmentFilterOperatorsBool
  | SegmentFilterOperatorsNumber
  | SegmentFilterOperatorsString;

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
  condition: GroupConditions;
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
  groups: SegmentGroup[];
  name: string;
  updatedAt: Date;
  userId: string;
  _id: string;
};

export type SegmentWithUser = Segment & {
  user: AppertureUser;
};

export enum SegmentFilterDataType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOL = 'True/ False',
}

export type FilterOptionMenuType = {
  id: string | number;
  label: SegmentFilterDataType | string;
  submenu: FilterOptionMenuType[];
};

export enum SegmentFilterOperatorsString {
  IS = 'is',
  IS_NOT = 'is not',
  CONTAINS = 'contains',
  DOES_NOT_CONTAIN = 'does not contain',
}

export enum SegmentFilterOperatorsNumber {
  EQ = 'equals',
  NE = 'not equal',
  GT = 'greater than',
  GE = 'greater than or equal to',
  LT = 'less than',
  LE = 'less than or equal to',
}

export enum SegmentFilterOperatorsBool {
  T = 'is true',
  F = 'is false',
}
