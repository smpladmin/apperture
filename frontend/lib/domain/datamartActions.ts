export enum ActionType {
  GOOGLE_SHEET = 'google_sheet',
  API = 'api',
  TABLE = 'table',
}

export type Spreadsheet = {
  id: string;
  name: string;
};

export type GoogleSheetMeta = {
  spreadsheet: Spreadsheet;
  sheet: string;
};
export type APIMeta = {
  url: string;
  headers: string;
};

export type TableMeta = {
  name: string;
};

export type ActionMeta = APIMeta | GoogleSheetMeta | TableMeta;

export enum ActionFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum TimePeriod {
  AM = 'AM',
  PM = 'PM',
}

export type Schedule = {
  time?: string;
  period?: TimePeriod;
  day?: string;
  date?: string;
  frequency: ActionFrequency;
};

export type DatamartActions = {
  _id: string;
  datasourceId: string;
  datamartId: string;
  type: ActionType;
  meta: ActionMeta;
  schedule: Schedule;
};
