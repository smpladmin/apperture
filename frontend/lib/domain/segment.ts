import {
  DateFilter,
  DateFilterType,
  FilterDataType,
  FilterOperators,
  FilterOperatorsNumber,
  GroupConditions,
} from './common';
import { AppertureUser } from './user';

export type WhereSegmentFilter = {
  condition: SegmentFilterConditions;
  operand: string;
  operator: FilterOperators;
  values: string[];
  all: boolean;
  type: FilterType;
  datatype: FilterDataType;
};

export type WhoSegmentFilter = {
  condition: SegmentFilterConditions;
  triggered: boolean;
  operand: string;
  aggregation: string;
  operator: FilterOperatorsNumber;
  values: string[];
  date_filter: DateFilter;
  date_filter_type: DateFilterType;
  type: FilterType;
  datatype: FilterDataType;
};

export type SegmentFilter = WhereSegmentFilter | WhoSegmentFilter;

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

export type FilterOptionMenuType = {
  id: string | number;
  label: FilterDataType | string;
  submenu: FilterOptionMenuType[];
};
