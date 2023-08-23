import { fillHeaders, fillRows } from '@components/Spreadsheet/util';
import { getRows } from '@components/Workbook/util';
import { CellChange, Column, Id, ReactGrid } from '@silevis/reactgrid';
import React, { useState } from 'react';

function PivotGrid({ sheetsData, selectedSheetIndex, setSheetsData }: any) {
  const [sheet, setSheet] = useState(sheetsData[selectedSheetIndex]);
  const [options, setOptions] = useState(
    sheetsData[selectedSheetIndex]?.meta?.selectedColumn
  );
  const [columns, setColumns] = useState<Column[]>([]);
  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };
  const handleDataChange = (changedValue: CellChange<any>[]) => {
    const changedHeaders = changedValue.filter(
      (value) => value.type === 'inputHeader'
    );
  };
  const [rows, setRows] = useState(
    getRows(
      fillRows(sheet.data, sheet.headers),
      fillHeaders(sheet.headers),
      sheet.headers,
      sheet.subHeaders,
      sheet,
      []
    )
  );
  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
      enableFillHandle
      enableRangeSelection
      enableColumnSelection
    />
  );
}

export default PivotGrid;
