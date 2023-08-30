import {
  // CellChange,
  CellLocation,
  // Column,
  DefaultCellTypes,
  Id,
  MenuOption,
  ReactGrid,
  // Row,
  SelectionMode,
} from '@silevis/reactgrid';
import React, { useEffect, useState } from 'react';
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
import {
  convertColumnValuesToPercentage,
  hasMetricColumnInPivotSheet,
  isSheetPivotOrBlank,
  fillHeaders,
  fillRows,
  increaseDecimalPlacesInColumnValues,
  decreaseDecimalPlacesInColumnValues,
} from '@components/Workbook/util';
import { cloneDeep } from 'lodash';
import AppertureSheet from '@components/AppertureSheets';
import {
  CellChange,
  Column,
  Row,
  TextCell,
} from '@components/AppertureSheets/types/gridTypes';

const getColumns = (headers: SpreadSheetColumn[]): Column[] => {
  return headers
    .filter((header) => header.name !== 'index')
    .map((header, index) => {
      return {
        columnId: header.name,
        resizable: true,
        width: 120,
      };
    });
};

const getSubHeaderRow = (
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[],
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData,
  properties: string[]
): Row<InputHeaderCell> => {
  return {
    rowId: 'subHeader',
    cells: headers
      .filter((header) => header.name !== 'index')
      .map((header, index) => {
        const isPivotOrBlankSheet = isSheetPivotOrBlank(sheetData);
        const dimensionSubHeaderCount = subHeaders.reduce(
          (acc: number, header: SubHeaderColumn) => {
            if (header.type === SubHeaderColumnType.DIMENSION) acc++;
            return acc;
          },
          0
        );
        const disableAddButton = hasMetricColumnInPivotSheet(sheetData);
        const showAddButton =
          isPivotOrBlankSheet && index === dimensionSubHeaderCount;

        if (header.type === ColumnType.QUERY_HEADER) {
          return {
            type: 'inputHeader',
            text: originalHeaders?.[index]?.name || '',
            disable: true,
            showAddButton,
            disableAddButton,
            showSuggestions: isPivotOrBlankSheet,
            properties,
            style: {
              overflow: 'initial',
            },
          };
        }

        return {
          type: 'inputHeader',
          text:
            header.type === ColumnType.PADDING_HEADER
              ? ''
              : originalHeaders?.[index]?.name || '',
          disable: false,
          showAddButton,
          disableAddButton,
          showSuggestions: isPivotOrBlankSheet,
          properties,
          columnType: subHeaders[index].type,
        };
      }),
  };
};

const getRows = (
  data: any[],
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[],
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData,
  properties: string[]
): Row<TextCell | InputHeaderCell>[] => [
  getSubHeaderRow(headers, originalHeaders, subHeaders, sheetData, properties),
  ...data.map<Row<TextCell>>((data, idx) => ({
    rowId: idx,
    cells: headers
      .filter((header) => header.name !== 'index')
      .map((header) => {
        const val =
          data[header.name]?.display === 0
            ? '0'
            : data[header.name]?.display || '';

        return { type: 'text', text: val };
      }),
  })),
];

const Grid = ({
  selectedSheetIndex,
  sheetsData,
  evaluateFormulaHeader,
  addDimensionColumn,
  properties,
  setSheetsData,
}: {
  selectedSheetIndex: number;
  sheetsData: TransientSheetData[];
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
  properties: string[];
  setSheetsData: Function;
}) => {
  const sheet = sheetsData[selectedSheetIndex];

  const [columns, setColumns] = useState<Column[]>(
    getColumns(fillHeaders(sheet.headers))
  );

  const [rows, setRows] = useState(
    getRows(
      fillRows(sheet.data, sheet.headers),
      fillHeaders(sheet.headers),
      sheet.headers,
      sheet.subHeaders,
      sheet,
      properties
    )
  );

  useEffect(() => {
    setColumns(getColumns(fillHeaders(sheet.headers)));
    setRows(
      getRows(
        fillRows(sheet.data, sheet.headers),
        fillHeaders(sheet.headers),
        sheet.headers,
        sheet.subHeaders,
        sheet,
        properties
      )
    );
  }, [sheet, selectedSheetIndex]);

  const handleColumnResize = (ci: string, width: number) => {
    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  };

  const handleDataChange = (
    changedValue: CellChange<TextCell | InputHeaderCell>[]
  ) => {
    const changedHeaders = changedValue.filter(
      (value) => value.type === 'inputHeader'
    );

    if ((changedHeaders[0]?.newCell as InputHeaderCell)?.addHeader) {
      return addDimensionColumn(changedHeaders[0].columnId);
    }

    changedHeaders[0] &&
      evaluateFormulaHeader(
        changedHeaders[0]?.newCell.text,
        changedHeaders[0]?.columnId
      );
  };

  const handleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[],
    selectedRanges: CellLocation[][]
  ): MenuOption[] => {
    if (selectionMode === 'column')
      return [
        {
          id: 'percentage',
          label: 'Convert to percentage',
          handler: (selectedRowIds, selectedColIds) => {
            setSheetsData((prevSheet: TransientSheetData[]) => {
              const sheetsCopy = cloneDeep(prevSheet);
              const data = sheetsCopy[selectedSheetIndex].data;
              sheetsCopy[selectedSheetIndex].data =
                convertColumnValuesToPercentage(selectedColIds, data);
              return sheetsCopy;
            });
          },
        },
        {
          id: 'floatingValue',
          label: 'Increase Decimal Place',
          handler: (selectedRowIds, selectedColIds) => {
            setSheetsData((prevSheet: TransientSheetData[]) => {
              const sheetsCopy = cloneDeep(prevSheet);
              const data = sheetsCopy[selectedSheetIndex].data;
              sheetsCopy[selectedSheetIndex].data =
                increaseDecimalPlacesInColumnValues(selectedColIds, data);
              return sheetsCopy;
            });
          },
        },
        {
          id: 'floatingValue2',
          label: 'Decrease Decimal Place',
          handler: (selectedRowIds, selectedColIds) => {
            setSheetsData((prevSheet: TransientSheetData[]) => {
              const sheetsCopy = cloneDeep(prevSheet);
              const data = sheetsCopy[selectedSheetIndex].data;
              sheetsCopy[selectedSheetIndex].data =
                decreaseDecimalPlacesInColumnValues(selectedColIds, data);
              return sheetsCopy;
            });
          },
        },
      ];

    return [];
  };

  const handleColumnSelections = (selectedColumns: string[]) => {};

  return (
    <AppertureSheet
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
      onColumnsSelections={handleColumnSelections}
    />
  );
};

export default Grid;
