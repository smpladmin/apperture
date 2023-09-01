import {
  CellChange,
  CellLocation,
  Column,
  DefaultCellTypes,
  Id,
  MenuOption,
  ReactGrid,
  Row,
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
  getRows,
} from '@components/Workbook/util';
import { cloneDeep } from 'lodash';
import { SheetChart } from '../DraggableWrapper';

const getColumns = (headers: SpreadSheetColumn[]): Column[] => {
  return headers.map((header, index) => {
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

    if (changedHeaders[0]?.newCell?.addHeader) {
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

  return (
    <div style={{ position: 'relative' }}>
      <ReactGrid
        rows={rows}
        columns={columns}
        onColumnResized={handleColumnResize}
        onCellsChanged={handleDataChange}
        enableFillHandle
        enableRangeSelection
        enableColumnSelection
        customCellTemplates={{
          dropdownHeader: new DropdownHeaderTemplate(),
          inputHeader: new InputHeaderTemplate(),
        }}
        onContextMenu={handleContextMenu}
      />
      <SheetChart />
    </div>
  );
};

export default Grid;
