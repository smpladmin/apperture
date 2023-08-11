import { Box, Flex } from '@chakra-ui/react';
import { range, throttle } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
  VariableSizeGrid as Grid,
  GridOnScrollProps,
  VariableSizeGrid,
} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ColumnResizer from './ColumnResizer';

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
      width: 240,
      resizable: true,
    }));
    return columns;
  };

  const [showEditableCell, setShowEditableCell] = useState(false);
  const [editableCellStyle, setShowEditableCellStyle] = useState({});
  const [columns, setColumns] = useState<Column[]>(createColumns());
  const [rows, setRows] = useState(createRows(columns));
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isCommandPressed, setIsCommandPressed] = useState(false);

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
      setShowEditableCellStyle(style);
    }

    setShowEditableCell(true);
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
                    rowHeight={(index) => 28}
                    height={28}
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
                    rowHeight={(index) => 28}
                    height={28}
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
                          selectedColumns={selectedColumns}
                          setSelectedColumns={setSelectedColumns}
                          isCommandPressed={isCommandPressed}
                          setIsCommandPressed={setIsCommandPressed}
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
                    rowHeight={(index) => 36}
                    height={height - 28}
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
                    rowHeight={(index) => 36}
                    height={height - 28}
                    width={width - 60}
                  >
                    {({ columnIndex, rowIndex, style }) => {
                      return (
                        <Cell
                          column={columns[columnIndex]}
                          columnIndex={columnIndex}
                          rowIndex={rowIndex}
                          style={style}
                          selectedColumns={selectedColumns}
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
                  onBlur={(e) => setShowEditableCell(false)}
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

export const HeaderCell = ({
  column,
  columnIndex,
  rowIndex,
  style,
  handleResize,
  selectedColumns,
  setSelectedColumns,
  isCommandPressed,
  setIsCommandPressed,
}: {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  handleResize: (columnId: string, newWidth: number) => void;
  selectedColumns: string[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
  isCommandPressed: boolean;
  setIsCommandPressed: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Meta' || event.key === 'Control') {
      setIsCommandPressed(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Meta' || event.key === 'Control') {
      setIsCommandPressed(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleColumnSelection = (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    columnName: string
  ) => {
    const element = e.currentTarget;
    const position = element?.getBoundingClientRect();

    const { left, width } = position;
    if (isCommandPressed) {
      setSelectedColumns((prevSelectedColumns) => {
        if (prevSelectedColumns.includes(columnName)) {
          return prevSelectedColumns.filter((name) => name !== columnName);
        } else {
          return [...prevSelectedColumns, columnName];
        }
      });
    } else {
      setSelectedColumns([columnName]);
    }
  };

  const isHeaderSelected = selectedColumns.includes(column.columnId);

  return (
    <Flex
      height={9}
      w={15}
      bg={isHeaderSelected ? 'blue.500' : 'white.500'}
      alignItems={'center'}
      justifyContent={'center'}
      borderRightWidth={'0.4px'}
      borderBottomWidth={'0.4px'}
      borderColor={'grey.700'}
      textAlign={'center'}
      fontSize={'xs-12'}
      lineHeight={'xs-12'}
      color={isHeaderSelected ? 'white.DEFAULT' : 'grey.600'}
      fontWeight={'400'}
      style={style}
      onClick={(e) => handleColumnSelection(e, column?.columnId)}
    >
      {String.fromCharCode(65 + columnIndex)}
      {column?.resizable && (
        <ColumnResizer column={column} handleResize={handleResize} />
      )}
    </Flex>
  );
};

export const Cell = ({
  column,
  columnIndex,
  rowIndex,
  style,
  selectedColumns,
  handleDoubleClick,
}: {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: any;
  selectedColumns: string[];
  handleDoubleClick: Function;
}) => {
  const columnId = column.columnId;
  const isCellSelected = selectedColumns.includes(columnId);
  return (
    <Flex
      tabIndex={0}
      alignItems={'center'}
      w={60}
      height={9}
      borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      borderLeftWidth={isCellSelected ? '1px' : '0'}
      backgroundColor={isCellSelected ? 'rgba(53,121,248,.35)' : 'transparent'}
      borderBottomWidth={'0.4px'}
      borderColor={isCellSelected ? 'blue.500' : 'grey.700'}
      color={'grey.800'}
      style={style}
      onDoubleClick={(e) => handleDoubleClick(e, rowIndex, columnIndex)}
    >
      Item {rowIndex},{columnIndex}
    </Flex>
  );
};
