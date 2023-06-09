import {
  CellChange,
  Column,
  DefaultCellTypes,
  Id,
  ReactGrid,
  Row,
} from '@silevis/reactgrid';
import React, { useEffect, useState } from 'react';
import { fillHeaders, fillRows } from '../../util';
import {
  ColumnType,
  SpreadSheetColumn,
  TransientSheetData,
} from '@lib/domain/workbook';
import { DropdownHeaderCell, DropdownHeaderTemplate } from './DropdownHeader';

const getGridRow = (value: any): DefaultCellTypes => {
  const cellTypes: { [key: string]: DefaultCellTypes } = {
    string: { type: 'text', text: value },
    number: { type: 'number', value: value },
    object: { type: 'text', text: JSON.stringify(value) },
  };

  return cellTypes[typeof value];
};

const getColumns = (headers: SpreadSheetColumn[]): Column[] => {
  return headers.map((header) => {
    if (header.name === 'index') {
      return { columnId: header.name, width: 50 };
    }
    return {
      columnId: header.name,
      resizable: true,
      width: header.name.length * 10 > 150 ? header.name.length * 10 : 150,
    };
  });
};

const getHeaderCell = (
  header: SpreadSheetColumn,
  index: number
): DefaultCellTypes | DropdownHeaderCell => {
  if (header.type === ColumnType.QUERY_HEADER) {
    if (header.name === 'index')
      return {
        type: 'header',
        text: '',
      };
    return {
      type: 'header',
      text: `${String.fromCharCode(65 + index - 1)} ${header.name}`,
    };
  }
  return {
    type: 'dropdownHeader',
    text: header.name,
    style: {
      overflow: 'initial',
      background: '#f2f2f2',
    },
  };
};

const getHeaderRow = (
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[]
): Row<DefaultCellTypes | DropdownHeaderCell> => {
  return {
    rowId: 'header',
    cells: headers.map((header, index) => {
      return getHeaderCell(header, index);
    }),
  };
};

const getRows = (
  data: any[],
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[]
): Row<DefaultCellTypes | DropdownHeaderCell>[] => [
  getHeaderRow(headers, originalHeaders),
  ...data.map<Row>((data, idx) => ({
    rowId: idx,
    cells: headers.map((header) => {
      const val = data[header.name];
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
