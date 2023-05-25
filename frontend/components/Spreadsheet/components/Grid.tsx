import { Column, Id, ReactGrid, Row } from '@silevis/reactgrid';
import { cloneDeep, head } from 'lodash';
import React, { useState } from 'react';
import { fillHeaders, fillRows } from '../util';

const getColumns = (headers: any[]): any[] => {
  return headers.map((header) => {
    if (header === 'index') {
      return { columnId: header, width: 50 };
    }
    return { columnId: header, resizable: true };
  });
};

const getHeaderRow = (headers: any[], originalHeaders: any[]): Row => {
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
  headers: any[],
  originalHeaders: any[]
): Row[] => [
  getHeaderRow(headers, originalHeaders),
  ...data.map<Row>((person, idx) => ({
    rowId: idx,
    cells: headers.map((header) => {
      return header === 'index'
        ? { type: 'number', value: person[header] }
        : { type: 'text', text: person[header] };
    }),
  })),
];

const Grid = ({ sheetData }: any) => {
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
