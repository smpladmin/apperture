import React from 'react';
import Sheet from './Sheet';
import GridContextProvider from './GridContext';
import { CellChange, Column } from './gridTypes';

const AppertureSheet = ({
  columns,
  rows,
  onColumnResized,
  onCellsChanged,
}: {
  columns: Column[];
  rows: any[];
  onColumnResized: (columnId: string, newWidth: number) => void;
  onCellsChanged: (changedCell: CellChange[]) => void;
}) => {
  return (
    <GridContextProvider>
      <Sheet
        columns={columns}
        rows={rows}
        onColumnResized={onColumnResized}
        onCellsChanged={onCellsChanged}
      />
    </GridContextProvider>
  );
};

export default AppertureSheet;
