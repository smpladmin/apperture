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

export type FunnelDateFilter = {
  filter: DateFilter | null;
  type: DateFilterType | null;
};
