export type Column = {
  columnId: string;
  width: number;
  resizable?: boolean;
};

export type BaseCellProps = {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: any;
};

type Id = number | string;

export type SelectedColumn = {
  columnId: string;
  columnIndex: number;
};

export type CellChange<T> = {
  rowId: Id;
  columnId: Id;
  columnIndex: number;
  type: string;
  newCell: T;
  previousCell: T;
};

export type TextCell = { type: 'text'; text: string | number };

export type InputHeaderCell = {
  type: 'inputHeader';
  text: string;
  disable?: boolean;
  showAddButton?: boolean;
  addHeader?: boolean;
  // columnType?: SubHeaderColumnType;
  properties: string[];
  showSuggestions?: boolean;
  disableAddButton?: boolean;
};

export type Row<T> = {
  rowId: string | number;
  cells: Array<T>;
};
