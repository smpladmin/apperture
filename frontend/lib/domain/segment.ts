import {
  DateFilter,
  DateFilterType,
  FilterConditions,
  FilterDataType,
  FilterOperatorsNumber,
  GroupConditions,
  WhereFilter,
} from './common';
import { AppertureUser } from './user';

export type WhoSegmentFilter = {
  condition: FilterConditions;
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

export type SegmentFilter = WhereFilter | WhoSegmentFilter;

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
