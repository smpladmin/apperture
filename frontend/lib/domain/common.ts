export type FixedDateFilter = {
  start_date: string;
  end_date: string;
};

export type SinceDateFilter = {
  start_date: string;
};

export type LastDateFilter = {
  days: number;
};

export type DateFilter = FixedDateFilter | SinceDateFilter | LastDateFilter;

export enum DateFilterType {
  FIXED = 'fixed',
  SINCE = 'since',
  LAST = 'last',
}

export type DateFilterObj = {
  filter: DateFilter | null;
  type: DateFilterType | null;
};

export enum FilterConditions {
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
  WHO = 'who',
}

export enum FilterType {
  WHERE = 'where',
  WHO = 'who',
}

export enum FilterOperatorsString {
  IS = 'is',
  IS_NOT = 'is not',
  CONTAINS = 'contains',
  DOES_NOT_CONTAIN = 'does not contain',
}

export enum FilterOperatorsNumber {
  EQ = 'equals',
  NE = 'not equal',
  GT = 'greater than',
  GE = 'greater than or equal to',
  LT = 'less than',
  LE = 'less than or equal to',
}

export enum FilterOperatorsBool {
  T = 'is true',
  F = 'is false',
}

export type FilterOperators =
  | FilterOperatorsBool
  | FilterOperatorsNumber
  | FilterOperatorsString;

export type WhereFilter = {
  condition: FilterConditions;
  operand: string;
  operator: FilterOperators;
  values: string[];
  all: boolean;
  type: FilterType;
  datatype: FilterDataType;
};

export enum FilterDataType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOL = 'True/ False',
}

export type FilterOptionMenuType = {
  id: string | number;
  label: FilterDataType | string;
  submenu: FilterOptionMenuType[];
};

export enum GroupConditions {
  AND = 'and',
  OR = 'or',
}

export const FilterOperatorsDatatypeMap = {
  [FilterDataType.BOOL]: Object.values(FilterOperatorsBool),
  [FilterDataType.NUMBER]: Object.values(FilterOperatorsNumber),
  [FilterDataType.STRING]: Object.values(FilterOperatorsString),
};

export const ISFilterOperators = [
  FilterOperatorsString.IS,
  FilterOperatorsString.IS_NOT,
];
