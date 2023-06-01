import { Column, Id, ReactGrid, Row } from '@silevis/reactgrid';
import React, { useState } from 'react';
import { fillHeaders, fillRows } from '../util';
import { TransientSheetData } from '@lib/domain/spreadsheet';

const getGridRow = (value: any): DefaultCellTypes => {
  const cellTypes: { [key: string]: DefaultCellTypes } = {
    string: { type: 'text', text: value },
    number: { type: 'number', value: value },
    object: { type: 'text', text: JSON.stringify(value) },
  };

  return cellTypes[typeof value];
};

const getColumns = (headers: string[]): Column[] => {
  return headers.map((header) => {
    if (header === 'index') {
      return { columnId: header, width: 50 };
    }
    return { columnId: header, resizable: true };
  });
};

const getHeaderRow = (headers: string[], originalHeaders: string[]): Row => {
  return {
    rowId: 'header',
    cells: headers.map((header, index) => {
      if (originalHeaders.includes(header)) {
        return {
          type: 'header',
          text: `${String.fromCharCode(65 + index - 1)} ${header}`,
        };
      } else if (header === 'index') {
        return {
          type: 'header',
          text: '',
        };
      } else {
        return {
          type: 'header',
          text: header,
        };
      }
    }),
  };
};

const getRows = (
  data: any[],
  headers: string[],
  originalHeaders: string[]
): Row[] => [
  getHeaderRow(headers, originalHeaders),
  ...data.map<Row>((person, idx) => ({
    rowId: idx,
    cells: headers.map((header) => {
      const val = person[header];
      return getGridRow(val);
    }),
  })),
];

const Grid = ({ sheetData }: { sheetData: TransientSheetData }) => {
  const [columns, setColumns] = useState<Column[]>(
    getColumns(fillHeaders(sheetData.headers))
  );

  const rows = getRows(
    fillRows(sheetData.data, sheetData.headers),
    fillHeaders(sheetData.headers),
    sheetData.headers
  );

  const handleColumnResize = (ci: Id, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      enableColumnSelection
      enableRowSelection
    />
  );
};

export default Grid;
