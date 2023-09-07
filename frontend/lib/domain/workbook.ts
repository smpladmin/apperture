import { AppertureUser as User } from './user';

export type TransientSheetData = {
  name: string;
  query: string;
  headers: SpreadSheetColumn[];
  subHeaders: SubHeaderColumn[];
  data: any[];
  charts: SheetChartDetail[];
  is_sql?: boolean;
  sheet_type?: SheetType;
  edit_mode?: boolean;
  aiQuery?: AIQuery;
  meta?: SheetMeta;
};

export type SheetMeta = {
  dsId: string;
  selectedColumns: string[];
  selectedTable: string;
  selectedDatabase: string;
  selectedSourceId: string;
  referenceSheetQuery?: string;
  selectedPivotColumns?: PivotAxisDetail[];
  selectedPivotRows?: PivotAxisDetail[];
  selectedPivotOptions?: string[];
  selectedPivotFilters?: string[];
  selectedPivotValues?: PivotValueDetail[];
  referenceSheetIndex?: number;
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

export enum SortingOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type PivotAxisDetail = {
  name: string;
  sort_by: string;
  order_by: SortingOrder;
  show_total: boolean;
};

export enum AggregateFunction {
  SUM = 'SUM',
}

export type PivotValueDetail = {
  name: string;
  function: AggregateFunction;
};

export type ChartSeries = {
  name: string;
  type: 'number' | 'string' | 'boolean';
};

export enum ChartType {
  COLUMN = 'column',
}

export type SheetChartDetail = {
  timestamp: number;
  name: string;
  x: number;
  y: number;
  height: number;
  width: number;
  series: ChartSeries[];
  type: ChartType;
  xAxis: ChartSeries[];
  yAxis: ChartSeries[];
};
