import React, { useEffect, useState } from 'react';
import {
  ColumnType,
  SheetChartDetail,
  SheetType,
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
  generatePivotCellStyles,
} from '@components/Workbook/util';
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

        if (header.type === ColumnType.QUERY_HEADER) {
          return {
            type: 'inputHeader',
            text: originalHeaders?.[index]?.name || '',
            disable: false,
            showAddButton: false,
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
          showAddButton: false,
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
): Row<TextCell | InputHeaderCell>[] => {
  const isPivot = sheetData.sheet_type === SheetType.PIVOT_TABLE;
  const lastRow = sheetData.data.length || 10;
  const lastColumn = sheetData.headers.length || 4;
  const gridRows = data.map<Row<TextCell>>((data, idx) => ({
    rowId: idx,
    cells: headers
      .filter((header) => header.name !== 'index')
      .map((header, index) => {
        const originalValue = data[header.name]?.original;
        const displayValue = data[header.name]?.display ?? '';
        let cellValue = displayValue;

        const cellFormat = sheetData?.columnFormat?.[index.toString()]?.format;

        const style: React.CSSProperties = isPivot
          ? generatePivotCellStyles(idx, index, lastRow, lastColumn, sheetData)
          : {};

        if (typeof cellValue === 'object') {
          cellValue = JSON.stringify(cellValue);
        }

        if (typeof originalValue === 'number') {
          const num = Number(cellValue);
          const numberFormat = new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 20,
          });
          cellValue = numberFormat.format(num);
        }

        if (cellFormat && cellValue) {
          // format number using original value
          cellValue = formatNumber(originalValue, cellFormat);
        }

        return {
          type: 'text',
          text: cellValue,
          style,
        };
      }),
  }));

  return !isPivot
    ? [
        getSubHeaderRow(
          headers,
          originalHeaders,
          subHeaders,
          sheetData,
          properties
        ),

        ...gridRows,
      ]
    : gridRows;
};

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
    <Box h="full" w="full" position={'relative'}>
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
