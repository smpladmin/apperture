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

type Id = number | string;
type CellValue = {
  value: string | number;
};

export type CellChange = {
  rowId: Id;
  columnId: Id;
  type: string;
  newCell: CellValue;
  previousCell: CellValue;
};
