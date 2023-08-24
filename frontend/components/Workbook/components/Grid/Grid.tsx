import {
  // CellChange,
  CellLocation,
  // Column,
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
} from '@components/Workbook/util';
import { cloneDeep } from 'lodash';
import AppertureSheet from '@components/AppertureSheets';
import { CellChange, Column } from '@components/AppertureSheets/gridTypes';

const getGridRow = (value: any): DefaultCellTypes => {
  const cellTypes: { [key: string]: DefaultCellTypes } = {
    string: { type: 'text', text: value },
    number: { type: 'number', value: value },
    object: { type: 'text', text: JSON.stringify(value) },
  };

  return cellTypes[typeof value];
};

// const getColumns = (headers: SpreadSheetColumn[]): Column[] => {
//   return headers.map((header, index) => {
//     if (header.name === 'index') {
//       return { columnId: header.name, width: 50 };
//     }
//     return {
//       columnId: header.name,
//       resizable: true,
//       width: 240,
//     };
//   });
// };
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

// const getHeaderRow = (
//   headers: SpreadSheetColumn[],
//   originalHeaders: SpreadSheetColumn[]
// ): Row<DefaultCellTypes | DropdownHeaderCell> => {
//   return {
//     rowId: 'header',
//     cells: headers.map((header, index) => {
//       if (
//         originalHeaders.includes(header) &&
//         header.type !== ColumnType.PADDING_HEADER
//       ) {
//         return {
//           type: 'header',
//           text: `${String.fromCharCode(65 + index - 1)} ${header.name}`,
//         };
//       }
//       if (header.name === 'index') {
//         return {
//           type: 'header',
//           text: '',
//         };
//       }
//       return {
//         type: 'header',
//         text: header.name,
//       };
//     }),
//   };
// };
const getHeaderRow = (
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[]
): any => {
  return {
    rowId: 'header',
    cells: originalHeaders
      .filter((header) => header.name !== 'index')
      .map((header, index) => {
        return {
          type: 'text',
          value: header.name,
        };
      }),
  };
};

const getSubHeaderRow = (
  headers: SpreadSheetColumn[],
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData,
  properties: string[]
): Row<DefaultCellTypes | InputHeaderCell> => {
  return {
    rowId: 'subHeader',
    cells: headers.map((header, index) => {
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
        text: `${subHeaders[index].name}`,
        disable: false,
        showAddButton,
        disableAddButton,
        showSuggestions: isPivotOrBlankSheet,
        properties,
        columnType: subHeaders[index].type,
        style: {
          overflow: 'initial',
        },
      };
    }),
  };
};

// const getRows = (
//   data: any[],
//   headers: SpreadSheetColumn[],
//   originalHeaders: SpreadSheetColumn[],
//   subHeaders: SubHeaderColumn[],
//   sheetData: TransientSheetData,
//   properties: string[]
// ): Row<DefaultCellTypes | DropdownHeaderCell | InputHeaderCell>[] => [
//   getHeaderRow(headers, originalHeaders),
//   getSubHeaderRow(headers, subHeaders, sheetData, properties),
//   ...data.map<Row>((data, idx) => ({
//     rowId: idx,
//     cells: headers.map((header) => {
//       const val =
//         data[header.name]?.display === 0
//           ? '0'
//           : data[header.name]?.display || '';

//       return getGridRow(val);
//     }),
//   })),
// ];

const getRows = (
  data: any[],
  headers: SpreadSheetColumn[],
  originalHeaders: SpreadSheetColumn[],
  subHeaders: SubHeaderColumn[],
  sheetData: TransientSheetData,
  properties: string[]
): any[] => [
  getHeaderRow(headers, originalHeaders),
  // getSubHeaderRow(headers, subHeaders, sheetData, properties),
  ...data.map((data, idx) => ({
    rowId: idx,
    cells: headers
      .filter((header) => header.name !== 'index')
      .map((header) => {
        const val =
          data[header.name]?.display === 0
            ? '0'
            : data[header.name]?.display || '';

        return { type: 'text', value: val };
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

  // const handleDataChange = (changedValue: CellChange<any>[]) => {
  //   const changedHeaders = changedValue.filter(
  //     (value) => value.type === 'inputHeader'
  //   );

  //   if (changedHeaders[0]?.newCell?.addHeader) {
  //     return addDimensionColumn(changedHeaders[0].columnId);
  //   }

  //   changedHeaders[0] &&
  //     evaluateFormulaHeader(
  //       changedHeaders[0]?.newCell.text,
  //       changedHeaders[0]?.columnId
  //     );
  // };

  const handleDataChange = (changedValue: CellChange[]) => {
    console.log('handleDataChange', changedValue);
    const changedHeaders = changedValue.filter(
      (value) => value.type === 'inputHeader'
    );

    // if (changedHeaders[0]?.newCell?.addHeader) {
    //   return addDimensionColumn(changedHeaders[0].columnId);
    // }

    changedHeaders[0] &&
      evaluateFormulaHeader(
        changedHeaders[0]?.newCell.value,
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
    // <ReactGrid
    //   rows={rows}
    //   columns={columns}
    //   onColumnResized={handleColumnResize}
    //   onCellsChanged={handleDataChange}
    //   enableFillHandle
    //   enableRangeSelection
    //   enableColumnSelection
    //   customCellTemplates={{
    //     dropdownHeader: new DropdownHeaderTemplate(),
    //     inputHeader: new InputHeaderTemplate(),
    //   }}
    //   onContextMenu={handleContextMenu}
    // />
    <AppertureSheet
      rows={rows}
      columns={columns}
      onColumnResized={handleColumnResize}
      onCellsChanged={handleDataChange}
    />
  );
};

export default Grid;
