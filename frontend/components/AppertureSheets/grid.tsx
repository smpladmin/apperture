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
import { Cell } from './Cell';
import { Actions, GridContext } from './GridContext';

export type Column = {
  columnId: string;
  width: number;
  resizable?: boolean;
};

const Sheet = () => {
  const createRows = (columns: Column[]) => {
    const row = {} as { [key: string]: string };
    const singleRow = columns.forEach((column) => {
      row[column.columnId] = '';
    });
    return new Array(1000).fill(row);
  };

  const createColumns = () => {
    const columns: Column[] = range(26).map((column, i) => ({
      columnId: String.fromCharCode(65 + column),
      width: 120,
      resizable: true,
    }));
    return columns;
  };

  const { state, dispatch } = useContext(GridContext);
  const { currentCell, editableCellStyle, showEditableCell } = state;

  const [columns, setColumns] = useState<Column[]>(createColumns());
  const [rows, setRows] = useState(createRows(columns));

  const staticGrid = React.useRef<VariableSizeGrid>(null);
  const staticGrid2 = React.useRef<VariableSizeGrid>(null);
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
  }, 50);

  useEffect(() => {
    staticGrid2.current?.resetAfterIndices({
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

  const handleDoubleClick = (event: any, row: number, col: number) => {
    const el = event.target;
    if (el) {
      const position = el.getBoundingClientRect();
      const style = {
        left: position.x,
        top: position.y,
        height: position.height,
        width: 'fit-content',
        minWidth: position.width,
      };
      dispatch({
        type: Actions.SET_EDITABLE_CELL_STYLE,
        payload: style,
      });
    }

    dispatch({
      type: Actions.SET_SHOW_EDITABLE_CELL,
      payload: false,
    });
  };

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
        staticGrid?.current?.scrollTo({ scrollLeft: 0, scrollTop });
      }
      if (!scrollUpdateWasRequested) {
        staticGrid2?.current?.scrollTo({ scrollLeft, scrollTop: 0 });
      }
    },
    []
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      const { key } = event;

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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentCell]);

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
                    ref={staticGrid}
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
                    ref={staticGrid2}
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
                    ref={staticGrid}
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
                      return (
                        <Cell
                          column={columns[columnIndex]}
                          columnIndex={columnIndex}
                          rowIndex={rowIndex}
                          style={style}
                          handleDoubleClick={handleDoubleClick}
                        />
                      );
                    }}
                  </Grid>
                </Box>
              </Flex>
              {showEditableCell && (
                <Flex
                  p={2}
                  whiteSpace={'nowrap'}
                  spellCheck={false}
                  maxW={'calc(100% - 20px)'}
                  ref={(el) => el?.focus()}
                  contentEditable
                  position={'absolute'}
                  style={editableCellStyle}
                  zIndex={'99'}
                  border={'1px solid blue'}
                  bg={'white.DEFAULT'}
                  alignItems={'center'}
                  px={1}
                  onBlur={(e) =>
                    dispatch({
                      type: Actions.SET_SHOW_EDITABLE_CELL,
                      payload: false,
                    })
                  }
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
