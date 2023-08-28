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
  value: string | number;
};
