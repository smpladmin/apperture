import {
  CellChange,
  Column,
  DefaultCellTypes,
  Id,
  ReactGrid,
  Row,
} from '@silevis/reactgrid';
import React, { useEffect, useState } from 'react';
import { fillHeaders, fillRows, infixToPrefix } from '../../util';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import { DropdownHeaderCell, DropdownHeaderTemplate } from './DropdownHeader';

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
    return {
      columnId: header,
      resizable: true,
      width: header.length * 10 > 150 ? header.length * 10 : 150,
    };
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
          style: {
            overflow: 'initial',
            background: '#f2f2f2',
          },
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
      return getGridRow(val);
    }),
  })),
];

const Grid = ({
  sheetData,
  evaluateFormulaHeader,
}: {
  sheetData: TransientSheetData;
  evaluateFormulaHeader: Function;
}) => {
  const [columns, setColumns] = useState<Column[]>(
    getColumns(fillHeaders(sheetData.headers))
  );

  const [rows, setRows] = useState(
    getRows(
      fillRows(sheetData.data, sheetData.headers),
      fillHeaders(sheetData.headers),
      sheetData.headers
    )
  );

  useEffect(() => {
    setColumns(getColumns(fillHeaders(sheetData.headers)));
    setRows(
      getRows(
        fillRows(sheetData.data, sheetData.headers),
        fillHeaders(sheetData.headers),
        sheetData.headers
      )
    );
  }, [sheetData]);

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
      (value) => value.type === 'dropdownHeader'
    );
    changedHeaders[0] && evaluateFormulaHeader(changedHeaders[0]);
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
      customCellTemplates={{ dropdownHeader: new DropdownHeaderTemplate() }}
    />
  );
};

export default Grid;
