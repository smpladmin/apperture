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
  SubHeaderColumn,
  SubHeaderColumnType,
  TransientSheetData,
} from '@lib/domain/workbook';
import { DropdownHeaderCell, DropdownHeaderTemplate } from './DropdownHeader';
import { InputHeaderCell, InputHeaderTemplate } from './InputHeader';
import { WHITE_DEFAULT } from '@theme/index';

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
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData
): Row<DefaultCellTypes | InputHeaderCell> => {
  return {
    rowId: 'subHeader',
    cells: headers.map((header, index) => {
      const isBlankSheet = !sheetData.is_sql && !sheetData.query;
      const dimensionSubHeaderCount = subHeaders.reduce(
        (acc: number, header: SubHeaderColumn) => {
          if (header.type === SubHeaderColumnType.DIMENSION) acc++;
          return acc;
        },
        0
      );
      const showAddButton = isBlankSheet && index === dimensionSubHeaderCount;
      if (header.name === 'index') {
        return {
          type: 'header',
          text: '',
          style: { background: WHITE_DEFAULT },
        };
      }
      if (header.type === ColumnType.QUERY_HEADER) {
        return {
          type: 'inputHeader',
          text: `${subHeaders[index].name}`,
          disable: true,
          showAddButton,
        };
      }
      return {
        type: 'inputHeader',
        text: `${subHeaders[index].name}`,
        disable: false,
        showAddButton,
        style: {
          overflow: 'initial',
        },
      };
    }),
  };
};

const getRows = (
  data: any[],
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[],
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData
): Row<DefaultCellTypes | DropdownHeaderCell | InputHeaderCell>[] => [
  getHeaderRow(headers, originalHeaders),
  getSubHeaderRow(headers, subHeaders, sheetData),
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
  addDimensionColumn,
}: {
  selectedSheetIndex: number;
  sheetData: TransientSheetData;
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
}) => {
  const [columns, setColumns] = useState<Column[]>(
    getColumns(fillHeaders(sheetData.headers))
  );

  const [rows, setRows] = useState(
    getRows(
      fillRows(sheetData.data, sheetData.headers),
      fillHeaders(sheetData.headers),
      sheetData.headers,
      sheetData.subHeaders,
      sheetData
    )
  );

  useEffect(() => {
    setColumns(getColumns(fillHeaders(sheetData.headers)));
    setRows(
      getRows(
        fillRows(sheetData.data, sheetData.headers),
        fillHeaders(sheetData.headers),
        sheetData.headers,
        sheetData.subHeaders,
        sheetData
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

    if (changedHeaders[0].newCell.addHeader) {
      return addDimensionColumn(changedHeaders[0].columnId);
    }

    changedHeaders[0] &&
      evaluateFormulaHeader(
        changedHeaders[0]?.newCell.text,
        changedHeaders[0]?.columnId
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
