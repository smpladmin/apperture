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
  operator: SegmentFilterOperators;
  values: string[];
  date_filter: DateFilter;
  date_filter_type: SegmentDateFilterType;
  type: FilterType;
};

export type SegmentFilter = WhereSegmentFilter | WhoSegmentFilter;

export enum SegmentFilterOperators {
  IS = 'is',
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
  condition: SegmentGroupConditions;
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
  groups: SegmentGroup[];
  name: string;
  updatedAt: Date;
  userId: string;
  _id: string;
};

export type SegmentFixedDateFilter = {
  start_date: string;
  end_date: string;
};

export type SegmentSinceDateFilter = {
  start_date: string;
};

export type SegmentLastDateFilter = {
  days: number;
};

export type DateFilter =
  | SegmentFixedDateFilter
  | SegmentSinceDateFilter
  | SegmentLastDateFilter;

export enum SegmentDateFilterType {
  FIXED = 'fixed',
  SINCE = 'since',
  LAST = 'last',
}

export enum SegmentFilterDataType {
  STRING = 'String',
  NUMBER = 'Number',
  DATETIME = 'Date',
  BOOL = 'True/ False',
}

export type FilterOptionMenuType = {
  id: string | number;
  label: SegmentFilterDataType | string;
  submenu: FilterOptionMenuType[];
};
