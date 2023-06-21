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
import { InputHeaderCell, InputHeaderTemplate } from './InputHeader';

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
      width: 240,
    };
  });
};

const getHeaderRow = (
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[]
): Row<DefaultCellTypes | DropdownHeaderCell> => {
  return {
    rowId: 'header',
    cells: headers.map((header, index) => {
      if (
        originalHeaders.includes(header) &&
        header.type !== ColumnType.PADDING_HEADER
      ) {
        return {
          type: 'header',
          text: `${String.fromCharCode(65 + index - 1)} ${header.name}`,
        };
      }
      if (header.name === 'index') {
        return {
          type: 'header',
          text: '',
        };
      }
      return {
        type: 'header',
        text: header.name,
      };
    }),
  };
};

const getSubHeaderRow = (
  headers: SpreadSheetColumn[],
  subHeaders: string[]
): Row<DefaultCellTypes | InputHeaderCell> => {
  return {
    rowId: 'subHeader',
    cells: headers.map((header, index) => {
      if (header.name === 'index') {
        return {
          type: 'header',
          text: '',
        };
      }
      if (header.type === ColumnType.QUERY_HEADER) {
        return {
          type: 'inputHeader',
          text: `${subHeaders[index]}`,
          disable: true,
        };
      }
      if (header.name === 'C' || header.name === 'B+10') {
        console.log('subheader name', subHeaders[index]);
      }
      return {
        type: 'inputHeader',
        text: `${subHeaders[index]}`,
        disable: false,
      };
    }),
  };
};

const getRows = (
  data: any[],
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[],
  subHeaders: string[]
): Row<DefaultCellTypes | DropdownHeaderCell | InputHeaderCell>[] => [
  getHeaderRow(headers, originalHeaders),
  getSubHeaderRow(headers, subHeaders),
  ...data.map<Row>((data, idx) => ({
    rowId: idx,
    cells: headers.map((header) => {
      const val = data[header.name] || '';
      return getGridRow(val);
    }),
  })),
];

const Grid = ({
  selectedSheetIndex,
  sheetData,
  evaluateFormulaHeader,
}: {
  selectedSheetIndex: number;
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
      sheetData.headers,
      sheetData.subHeaders
    )
  );



  useEffect(() => {
    setColumns(getColumns(fillHeaders(sheetData.headers)));
    setRows(
      getRows(
        fillRows(sheetData.data, sheetData.headers),
        fillHeaders(sheetData.headers),
        sheetData.headers,
        sheetData.subHeaders
      )
    );
  }, [sheetData, selectedSheetIndex]);

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
    changedHeaders[0] &&
      evaluateFormulaHeader(
        changedHeaders[0]?.newCell.text,
        changedHeaders[0]?.columnId,
        changedHeaders[0]?.previousCell.text
      );
  };

  return (
    <ReactGrid
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
      customCellTemplates={{
        dropdownHeader: new DropdownHeaderTemplate(),
        inputHeader: new InputHeaderTemplate(),
      }}
    />
  );
};

export default Grid;
