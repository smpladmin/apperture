import { AppertureUser as User } from './user';

export type TransientSheetData = {
  name: string;
  query: string;
  headers: SpreadSheetColumn[];
  subHeaders: SubHeaderColumn[];
  data: any[];
  is_sql?: boolean;
  sheet_type?: SheetType;
  edit_mode?: boolean;
  meta?: {
    dsId: string;
    selectedColumns: string[];
  };
  word_replacements?: Array<WordReplacement>;
};

export type WordReplacement = { word: string; replacement: string };

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

export enum SheetType {
  SIMPLE_SHEET = 'SIMPLE_SHEET',
  PIVOT_SHEET = 'PIVOT_SHEET',
}

export type Spreadsheet = {
  name: string;
  headers: SpreadSheetColumn[];
  subHeaders: SubHeaderColumn[];
  is_sql?: boolean;
  sheet_type?: SheetType;
  query: string;
  edit_mode?: boolean;
  meta?: any;
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

export type TransientColumnRequestState = {
  isLoading: boolean;
  subheaders: { name: string; type: SubHeaderColumnType }[];
};
