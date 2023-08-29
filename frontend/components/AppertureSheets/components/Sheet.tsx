import { Box, Flex } from '@chakra-ui/react';
import { throttle } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  VariableSizeGrid as Grid,
  GridOnScrollProps,
  VariableSizeGrid,
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { HeaderCell } from './HeaderCell';
import { Actions, GridContext } from '../context/GridContext';
import sanitizeHtml from 'sanitize-html';
import BaseCell from './BaseCell';
import TextCellComponent from './TextCell';
import InputHeader from './InputHeader';
import {
  BaseCellProps,
  CellChange,
  Column,
  InputHeaderCell,
  Row,
  TextCell,
} from '../types/gridTypes';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

const componentMap: Record<string, React.ComponentType<any>> = {
  text: TextCellComponent,
  inputHeader: InputHeader,
};

const Sheet = ({
  columns,
  rows,
  onColumnResized,
  onCellsChanged,
  onColumnsSelections,
}: {
  columns: Column[];
  rows: Row<TextCell | InputHeaderCell>[];
  onColumnResized: (columnId: string, newWidth: number) => void;
  onCellsChanged: (
    changedCell: CellChange<TextCell | InputHeaderCell>[]
  ) => void;
  onColumnsSelections?: (columnIds: string[]) => void;
}) => {
  const { state, dispatch } = useContext(GridContext);
  const {
    currentCell,
    editableCellStyle,
    showEditableCell,
    currentCellValue,
    isSheetActive,
    selectedColumns,
  } = state;

  const spreadsheetRef = React.useRef(null);

  useOnClickOutside(spreadsheetRef, () => {
    dispatch({
      type: Actions.SET_SHEET_ACTIVE,
      payload: false,
    });
  });

  const rowIndexGrid = React.useRef<VariableSizeGrid>(null);
  const headerGrid = React.useRef<VariableSizeGrid>(null);
  const sheetRef = React.useRef<VariableSizeGrid>(null);

  const handleResize = throttle((columnId: string, width: number) => {
    onColumnResized(columnId, width);
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

    const changedCell: CellChange<TextCell> = {
      rowId: rowIndex,
      columnId: columnId,
      type: 'text',
      newCell: {
        type: 'text',
        text: sanitizedContent,
      },
      previousCell: {
        type: 'text',
        text: currentCellValue,
      },
    };
    onCellsChanged?.([changedCell]);

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
    // on column selection, call prop onColumnSelection
    onColumnsSelections?.(selectedColumns);
  }, [selectedColumns]);

  useEffect(() => {
    console.log('sheet active inside effect', isSheetActive);

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
        console.log({ key });
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

    spreadsheetRef?.current?.addEventListener('keydown', handleKeyPress);
    spreadsheetRef?.current?.addEventListener('keyup', handleKeyUp);

    return () => {
      spreadsheetRef?.current?.removeEventListener('keydown', handleKeyPress);
      spreadsheetRef?.current?.removeEventListener('keyup', handleKeyUp);
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
    <Box
      height={'100%'}
      width={'100%'}
      ref={spreadsheetRef}
      onClick={
        () => {}
        // dispatch({
        //   type: Actions.SET_SHEET_ACTIVE,
        //   payload: true,
        // })
      }
    >
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => {
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
                        borderTopWidth={'0.4px'}
                        borderRightWidth={'0.4px'}
                        borderBottomWidth={'0.4px'}
                        borderColor={'grey.700'}
                        bg={'white.500'}
                      />
                    )}
                  </Grid>
                </Box>
                <Box>
                  {/* Header */}
                  <Grid
                    ref={headerGrid}
                    style={{ overflowX: 'hidden' }}
                    columnCount={columns.length}
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
                    rowCount={rows.length}
                    rowHeight={(index) => 24}
                    height={height - 24}
                    width={width - 60}
                    overscanRowCount={20}
                  >
                    {({ columnIndex, rowIndex, style }) => {
                      const cell = rows[rowIndex]?.cells?.[columnIndex];
                      const cellType = cell?.type || 'text';

                      const baseCellProps: BaseCellProps = {
                        columnIndex,
                        rowIndex,
                        style,
                        column: columns[columnIndex],
                      };

                      const CellToRender = componentMap[cellType];
                      return (
                        <BaseCell {...baseCellProps}>
                          <CellToRender
                            {...baseCellProps}
                            cell={cell}
                            onCellsChanged={onCellsChanged}
                          />
                        </BaseCell>
                      );
                    }}
                  </Grid>
                </Box>
              </Flex>
              {showEditableCell && (
                <Flex
                  whiteSpace={'pre-wrap'}
                  wordBreak={'break-all'}
                  spellCheck={false}
                  height={'auto'}
                  ref={(el) => el?.focus()}
                  contentEditable={true}
                  position={'absolute'}
                  zIndex={'9'}
                  border={'1px solid blue.500'}
                  bg={'white.DEFAULT'}
                  alignItems={'center'}
                  fontSize={'xs-12'}
                  px={1}
                  pt={'1px'}
                  style={editableCellStyle}
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
