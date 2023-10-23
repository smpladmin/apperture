export type ActiveCell = {
  sheetName: string;
  rowIndex: number;
  columnIndex: number;
};

export enum MessageType {
  VIEW_QUERIES = 'View Queries',
  SELECTED_QUERY = 'Selected Query',
  NLP_TEXT = 'NLP Text',
  RESPONSE_TEXT = 'Response Text',
}

export type Message = {
  sender: string;
  text: string;
  type: MessageType;
  timestamp: string;
  selectedWorkbook?: WorkbookWithSheet;
};

export type ConnectionSource = {
  id: string;
  name: string;
  fields: string[];
  datasource_id: string;
  table_name: string;
  database_name: string;
};

export type ConnectionGroup = {
  provider: string;
  connection_source: ConnectionSource[];
};

export type Connection = {
  server: string;
  connection_data: ConnectionGroup[];
};

export type AIQuery = {
  nlQuery: string;
  wordReplacements: Array<WordReplacement>;
  sql?: string;
  table: string;
  database: string;
};

export type ColumnFormat = Record<
  string,
  {
    format?: {
      percent: boolean;
      decimal: number;
    };
    width?: number;
  }
>;

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
  column_format?: ColumnFormat;
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

export type WorkbookWithSheet = {
  id: string;
  name: string;
  sheet: Spreadsheet;
};

export type SheetQuery = {
  _id: string;
  updatedAt: string;
  name: string;
  query: string;
  chats: any[];
  spreadsheetId: string;
  sheetReference: ActiveCell;
};
