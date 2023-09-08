import React, { useEffect, useState } from 'react';
import {
  ColumnType,
  SheetChartDetail,
  SpreadSheetColumn,
  SubHeaderColumn,
  SubHeaderColumnType,
  TransientSheetData,
} from '@lib/domain/workbook';
import {
  hasMetricColumnInPivotSheet,
  isSheetPivotOrBlank,
  fillHeaders,
  fillRows,
  formatNumber,
} from '@components/Workbook/util';
import { cloneDeep } from 'lodash';
import { SheetChart } from '../DraggableWrapper';

import AppertureSheet from '@components/AppertureSheets';
import {
  CellChange,
  Column,
  InputHeaderCell,
  Row,
  SelectedColumn,
  TextCell,
} from '@components/AppertureSheets/types/gridTypes';
import { Box } from '@chakra-ui/react';

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
      .map((header, index) => {
        const originalValue = data[header.name]?.original;
        let val = originalValue === 0 ? '0' : originalValue || '';

        const format = sheetData?.columnFormat?.[index.toString()]?.format;

        if (format && val) {
          val = formatNumber(val, format);
        }

        const value = typeof val === 'object' ? JSON.stringify(val) : val;
        return { type: 'text', text: value };
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
  showChartPanel,
  hideChartPanel,
  updateChart,
  setIsFormulaEdited,
  setSelectedColumns,
}: {
  selectedSheetIndex: number;
  sheetsData: TransientSheetData[];
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
  properties: string[];
  setSheetsData: Function;
  showChartPanel: (data: SheetChartDetail) => void;
  hideChartPanel: () => void;
  updateChart: (timestamp: number, updatedChartData: SheetChartDetail) => void;
  setIsFormulaEdited: Function;
  setSelectedColumns: Function;
}) => {
  const sheet = sheetsData[selectedSheetIndex];

  const [columns, setColumns] = useState<Column[]>(
    getColumns(fillHeaders(sheet.headers))
  );

  const [charts, setCharts] = useState(sheet.charts);

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

  const handleColumnResize = (
    columnId: string,
    columnIndex: number,
    width: number
  ) => {
    setColumns((prevColumns) => {
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

    if (changedHeaders[0]) {
      setIsFormulaEdited(true);
      evaluateFormulaHeader(
        changedHeaders[0]?.newCell.text,
        changedHeaders[0]?.columnId,
        changedHeaders[0]?.columnIndex
      );
    }
  };

  const handleColumnSelections = (selectedColumns: SelectedColumn[]) => {
    setSelectedColumns(selectedColumns);
  };

  return (
    <Box position="relative">
      <AppertureSheet
        rows={rows}
        columns={columns}
        onColumnResized={handleColumnResize}
        onCellsChanged={handleDataChange}
        onColumnsSelections={handleColumnSelections}
      />
      {sheet.charts?.map((chart) => (
        <SheetChart
          updateChart={updateChart}
          chartData={chart}
          key={chart.timestamp}
          showChartPanel={showChartPanel}
          hideChartPanel={hideChartPanel}
          sheetData={sheet.data}
        />
      ))}
    </Box>
  );
};

export default Grid;
