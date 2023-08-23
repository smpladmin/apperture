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
  aiQuery?: AIQuery;
  meta?: {
    dsId: string;
    selectedColumns: string[];
    selectedTable: string;
    selectedDatabase: string;
    selectedSourceId: string;
    referenceSheetQuery?: string;
    selectedRows?: string[];
    selectedOptions?: string[];
    selectedFilters?: string[];
    selectedValues?: string[];
  };
};

export type AIQuery = {
  nlQuery: string;
  wordReplacements: Array<WordReplacement>;
  sql?: string;
  table: string;
  database: string;
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
  PIVOT_TABLE = 'PIVOT_TABLE',
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
  ai_query?: AIQuery;
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
