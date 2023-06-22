import { AppertureUser as User } from './user';

export type TransientSheetData = {
  name: string;
  query: string;
  headers: SpreadSheetColumn[];
  subHeaders: SubHeaderColumn[];
  data: any[];
  is_sql: boolean;
};

export enum ColumnType {
  COMPUTED_HEADER = 'COMPUTED_HEADER',
  QUERY_HEADER = 'QUERY_HEADER',
  PADDING_HEADER = 'PADDING_HEADER',
}

export enum SubHeaderColumnType {
  DIMENSION = 'DIMENSION',
  METRIC = 'METRIC',
}

export type SpreadSheetColumn = {
  name: string;
  type: ColumnType;
};

export type SubHeaderColumn = {
  name: string;
  type: SubHeaderColumnType;
};

export type Spreadsheet = {
  name: string;
  headers: SpreadSheetColumn[];
  subHeaders: SubHeaderColumn[];
  is_sql: boolean;
  query: string;
};

export type Workbook = {
  _id: string;
  datasourceId: string;
  appId: string;
  userId: string;
  name: string;
  spreadsheets: Spreadsheet[];
  enabled: boolean;
};

export type WorkbookWithUser = Workbook & { user: User };
