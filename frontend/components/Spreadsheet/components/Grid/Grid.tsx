import {
  Column,
  DefaultCellTypes,
  Id,
  ReactGrid,
  Row,
} from '@silevis/reactgrid';
import React, { useState } from 'react';
import { fillHeaders, fillRows } from '../../util';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import { DropdownHeaderCell, DropdownHeaderTemplate } from './DropdownHeader';

const getColumns = (headers: string[]): Column[] => {
  return headers.map((header) => {
    if (header === 'index') {
      return { columnId: header, width: 50 };
    }
    return { columnId: header, resizable: true };
  });
};

const getHeaderRow = (
  headers: string[],
  originalHeaders: string[]
): Row<DefaultCellTypes | DropdownHeaderCell> => {
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
          type: 'dropdownHeader',
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
): Row<DefaultCellTypes | DropdownHeaderCell>[] => [
  getHeaderRow(headers, originalHeaders),
  ...data.map<Row>((person, idx) => ({
    rowId: idx,
    cells: headers.map((header) => {
      const val = person[header];
      return header === 'index'
        ? { type: 'number', value: val }
        : {
            type: 'text',
            text: typeof val === 'object' ? JSON.stringify(val) : val,
          };
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

  const handleDataChange = (value: any) => {
    console.log('value change', value);
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
      customCellTemplates={{ dropdownHeader: new DropdownHeaderTemplate() }}
      enableColumnSelection
      enableRowSelection
    />
  );
};

export default Grid;
