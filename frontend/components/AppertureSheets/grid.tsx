import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { range } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Nossr from './nossr';
// import { useWindowSize } from "@uidotdev/usehooks";

const Sheet = () => {
  // const { width, height } = useWindowSize();
  const createRows = () => {
    const row = {} as { [key: string]: string };
    const singleRow = columns.forEach((column) => {
      row[String.fromCharCode(65 + column)] = '';
    });
    return new Array(1000).fill(row);
  };

  const rows = range(1000);
  const columns = range(27);
  const tableRef = useRef(null);
  const [data, setData] = useState<any[]>([]);
  const [showEditableCell, setShowEditableCell] = useState(false);
  const [editableCellStyle, setShowEditableCellStyle] = useState({});

  useEffect(() => {
    setData(createRows() as any[]);
  }, []);

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
    style: any;
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

  const IndexCell2 = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: any;
  }) => {
    return (
      <Flex
        height={9}
        w={15}
        bg={'white.500'}
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
        {String.fromCharCode(65 + columnIndex)}
      </Flex>
    );
  };

  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: any;
  }) => {
    return (
      <Flex
        tabIndex={0}
        alignItems={'center'}
        w={60}
        height={9}
        borderRightWidth={'0.4px'}
        borderBottomWidth={'0.4px'}
        borderColor={'grey.700'}
        color={'grey.800'}
        style={style}
        onDoubleClick={(e) => handleDoubleClick(e, rowIndex, columnIndex)}
      >
        Item {rowIndex},{columnIndex}
      </Flex>
    );
  };

  const staticGrid = React.useRef(null);
  const staticGrid2 = React.useRef(null);
  const onScroll = useCallback(
    ({ scrollTop, scrollLeft, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested) {
        staticGrid.current.scrollTo({ scrollLeft: 0, scrollTop });
      }
      if (!scrollUpdateWasRequested) {
        staticGrid2.current.scrollTo({ scrollLeft, scrollTop: 0 });
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
                    columnWidth={(index) => 240}
                    rowCount={1}
                    rowHeight={(index) => 28}
                    height={28}
                    width={width - 60}
                  >
                    {IndexCell2}
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
                    style={{ scrollbarWidth: 'none' }}
                    onScroll={onScroll}
                    columnCount={26}
                    columnWidth={(index) => 240}
                    rowCount={1000}
                    rowHeight={(index) => 36}
                    height={height - 28}
                    width={width - 60}
                  >
                    {Cell}
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
                ></Flex>
              )}
            </Flex>
          );
        }}
      </AutoSizer>
    </Box>
  );
};

export default Sheet;
