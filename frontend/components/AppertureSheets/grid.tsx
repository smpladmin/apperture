import { Box, Flex } from '@chakra-ui/react';
import { range, throttle } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  VariableSizeGrid as Grid,
  GridOnScrollProps,
  VariableSizeGrid,
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { HeaderCell } from './HeaderCell';
import Cell from './Cell';
import { Actions, GridContext } from './GridContext';
import sanitizeHtml from 'sanitize-html';
import CustomCell from './CustomCell';
import BaseCell from './BaseCell';

export type Column = {
  columnId: string;
  width: number;
  resizable?: boolean;
};

export type BaseCellProps = {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: any;
  value: string | number;
};

const componentMap: Record<string, React.ComponentType<any>> = {
  cell: Cell,
  customCell: CustomCell,
};

const Sheet = () => {
  const people = [
    { name: 'Thomas', surname: 'Goldman' },
    { name: 'Susie', surname: 'Quattro' },
    { name: '', surname: '' },
  ];

  const rowCells: any[] = [...people].map((person, idx) => ({
    rowId: idx,
    cells: [
      { type: 'cell', value: person.name },
      { type: 'cell', value: person.surname },
      { type: 'customCell', value: 'custom' },
    ],
  }));

  const createRows = (columns: Column[]) => {
    const row = {} as { [key: string]: string };
    const singleRow = columns.forEach((column) => {
      row[column.columnId] = '';
    });
    return new Array(1000).fill(row);
  };

  const createColumns = () => {
    const columns: Column[] = range(26).map((column, i) => {
      let columnId;
      if (i === 0 || i === 1) {
        let givenColumnsIds = ['name', 'surname'];
        columnId = givenColumnsIds[i];
      } else {
        columnId = String.fromCharCode(65 + i);
      }
      return {
        columnId,
        width: 120,
        resizable: true,
      };
    });
    return columns;
  };

  const { state, dispatch } = useContext(GridContext);
  const { currentCell, editableCellStyle, showEditableCell, currentCellValue } =
    state;

  const [columns, setColumns] = useState<Column[]>(createColumns());
  const [rows, setRows] = useState(createRows(columns));

  const rowIndexGrid = React.useRef<VariableSizeGrid>(null);
  const headerGrid = React.useRef<VariableSizeGrid>(null);
  const sheetRef = React.useRef<VariableSizeGrid>(null);

  const handleResize = throttle((columnId: string, width: number) => {
    setColumns((prevColumns: Column[]) => {
      const columnIndex = prevColumns.findIndex(
        (el) => el.columnId === columnId
      );
      const resizedColumn = prevColumns[columnIndex];
      const updatedColumn = { ...resizedColumn, width };
      prevColumns[columnIndex] = updatedColumn;
      return [...prevColumns];
    });
  }, 15);

  const handleCellChange = (event: any) => {
    const sanitizeConf = {
      allowedTags: ['b', 'i', 'a', 'p'],
      allowedAttributes: { a: ['href'] },
    };
    const sanitizedContent = sanitizeHtml(
      event.currentTarget.innerHTML,
      sanitizeConf
    );

    const columnId = columns[currentCell.column].columnId;
    const rowIndex = currentCell.row;

    setRows((prevState) => {
      const tempState = [...prevState];
      tempState[rowIndex] = {
        ...tempState[rowIndex],
        [columnId]: sanitizedContent,
      };
      return tempState;
    });

    dispatch({
      type: Actions.SET_SHOW_EDITABLE_CELL,
      payload: false,
    });
  };

  useEffect(() => {
    headerGrid.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true,
    });
    sheetRef.current?.resetAfterIndices({
      columnIndex: 0,
      rowIndex: 0,
      shouldForceUpdate: true,
    });
  }, [columns]);

  useEffect(() => {
    sheetRef.current?.scrollToItem({
      align: 'auto',
      columnIndex: currentCell.column,
      rowIndex: currentCell.row,
    });
    rowIndexGrid.current?.scrollToItem({
      align: 'auto',
      rowIndex: currentCell.row,
    });
    headerGrid.current?.scrollToItem({
      align: 'auto',
      columnIndex: currentCell.column,
    });
  }, [currentCell]);

  useEffect(() => {
    if (showEditableCell) return;

    const isInputOrTextArea = (
      element: EventTarget | null
    ): element is HTMLInputElement | HTMLTextAreaElement => {
      return (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      );
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (isInputOrTextArea(event.target)) {
        return;
      }
      const { key } = event;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
      }

      switch (key) {
        case 'ArrowUp':
          dispatch({
            type: Actions.SET_CURRENT_CELL,
            payload: {
              ...currentCell,
              row: Math.max(0, currentCell.row - 1),
            },
          });
          break;
        case 'ArrowDown':
          dispatch({
            type: Actions.SET_CURRENT_CELL,
            payload: {
              ...currentCell,
              row: Math.min(rows.length - 1, currentCell.row + 1),
            },
          });
          break;
        case 'ArrowLeft':
          dispatch({
            type: Actions.SET_CURRENT_CELL,
            payload: {
              ...currentCell,
              column: Math.max(0, currentCell.column - 1),
            },
          });
          break;
        case 'ArrowRight':
          dispatch({
            type: Actions.SET_CURRENT_CELL,
            payload: {
              ...currentCell,
              column: Math.min(columns.length - 1, currentCell.column + 1),
            },
          });
          break;
        case 'Meta':
        case 'Control':
          dispatch({ type: Actions.SET_IS_COMMAND_PRESSED, payload: true });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Meta' || event.key === 'Control') {
        dispatch({ type: Actions.SET_IS_COMMAND_PRESSED, payload: false });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentCell]);

  const IndexCell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    return (
      <Flex
        height={9}
        w={15}
        bg={'white.DEFAULT'}
        alignItems={'center'}
        justifyContent={'center'}
        borderRightWidth={'0.4px'}
        borderBottomWidth={'0.4px'}
        borderColor={'grey.700'}
        textAlign={'center'}
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        color={'grey.600'}
        fontWeight={'400'}
        style={style}
      >
        {rowIndex + 1}
      </Flex>
    );
  };

  const onScroll = useCallback(
    ({
      scrollTop,
      scrollLeft,
      scrollUpdateWasRequested,
    }: GridOnScrollProps) => {
      if (!scrollUpdateWasRequested) {
        rowIndexGrid?.current?.scrollTo({ scrollTop });
      }
      if (!scrollUpdateWasRequested) {
        headerGrid?.current?.scrollTo({ scrollLeft });
      }
    },
    []
  );

  return (
    <Box height={'100%'} width={'100%'}>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <Flex direction={'column'}>
              <Flex direction={'row'}>
                <Box>
                  {/* empty top left corner */}
                  <Grid
                    columnCount={1}
                    columnWidth={(index) => 60}
                    rowCount={1}
                    rowHeight={(index) => 24}
                    height={24}
                    width={60}
                  >
                    {({ style }) => (
                      <Box
                        style={style}
                        w={60}
                        height={9}
                        borderRightWidth={'0.4px'}
                        borderBottomWidth={'0.4px'}
                        borderColor={'grey.700'}
                      ></Box>
                    )}
                  </Grid>
                </Box>
                <Box>
                  {/* Header */}
                  <Grid
                    ref={headerGrid}
                    style={{ overflowX: 'hidden' }}
                    columnCount={26}
                    columnWidth={(index) => columns[index].width}
                    rowCount={1}
                    rowHeight={(index) => 24}
                    height={24}
                    width={width - 60}
                  >
                    {({ columnIndex, rowIndex, style }) => {
                      return (
                        <HeaderCell
                          column={columns[columnIndex]}
                          columnIndex={columnIndex}
                          rowIndex={rowIndex}
                          handleResize={handleResize}
                          style={style}
                        />
                      );
                    }}
                  </Grid>
                </Box>
              </Flex>
              <Flex direction={'row'}>
                <Box>
                  {/* Left Row Indexes */}
                  <Grid
                    ref={rowIndexGrid}
                    style={{ overflowY: 'hidden' }}
                    columnCount={1}
                    columnWidth={(index) => 60}
                    rowCount={1000}
                    rowHeight={(index) => 24}
                    height={height - 24}
                    width={60}
                  >
                    {IndexCell}
                  </Grid>
                </Box>
                <Box>
                  {/* The Sheet */}
                  <Grid
                    ref={sheetRef}
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={onScroll}
                    columnCount={26}
                    columnWidth={(index) => columns[index].width}
                    rowCount={1000}
                    rowHeight={(index) => 24}
                    height={height - 24}
                    width={width - 60}
                  >
                    {({ columnIndex, rowIndex, style }) => {
                      const cellValue =
                        rowCells[rowIndex]?.cells?.[columnIndex]?.value || '';

                      const baseCellProps: BaseCellProps = {
                        columnIndex,
                        rowIndex,
                        style,
                        column: columns[columnIndex],
                        value: cellValue,
                      };

                      const cellType =
                        rowCells[rowIndex]?.cells?.[columnIndex]?.type ||
                        'cell';

                      const CellToRender = componentMap[cellType];

                      return (
                        <BaseCell {...baseCellProps}>
                          <CellToRender {...baseCellProps} />
                        </BaseCell>
                      );
                    }}
                  </Grid>
                </Box>
              </Flex>
              {showEditableCell && (
                <Flex
                  whiteSpace={'pre-wrap'}
                  spellCheck={false}
                  ref={(el) => el?.focus()}
                  contentEditable={true}
                  position={'absolute'}
                  style={editableCellStyle}
                  zIndex={'9'}
                  border={'1px solid blue'}
                  bg={'white.DEFAULT'}
                  alignItems={'center'}
                  fontSize={'xs-12'}
                  px={1}
                  pt={'1px'}
                  dangerouslySetInnerHTML={{ __html: currentCellValue }}
                  onBlur={(e) => handleCellChange(e)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCellChange(e)}
                />
              )}
            </Flex>
          );
        }}
      </AutoSizer>
    </Box>
  );
};

export default Sheet;
