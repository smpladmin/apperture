import React from 'react';
import Sheet from './components/Sheet';
import GridContextProvider from './context/GridContext';
import {
  CellChange,
  Column,
  InputHeaderCell,
  Row,
  TextCell,
} from './types/gridTypes';

const AppertureSheet = ({
  columns,
  rows,
  onColumnResized,
  onCellsChanged,
  onColumnsSelections,
}: {
  columns: Column[];
  rows: Row<TextCell | InputHeaderCell>[];
  onColumnResized: (
    columnId: string,
    columnIndex: number,
    newWidth: number
  ) => void;
  onCellsChanged: (
    changedCell: CellChange<TextCell | InputHeaderCell>[]
  ) => void;
  onColumnsSelections?: (columnIds: string[]) => void;
}) => {
  return (
    <GridContextProvider>
      <Sheet
        columns={columns}
        rows={rows}
        onColumnResized={onColumnResized}
        onCellsChanged={onCellsChanged}
        onColumnsSelections={onColumnsSelections}
      />
    </GridContextProvider>
  );
};

export default AppertureSheet;
