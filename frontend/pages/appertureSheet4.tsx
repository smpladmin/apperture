import React, { useState } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { Box, Flex, Text } from '@chakra-ui/react';

const columnCount = 27;
const rowCount = 1000;
const columnWidth = 100;
const rowHeight = 30;
const stickyColumnWidth = 50;

const Spreadsheet = () => {
  const columnNames = Array.from({ length: columnCount }, (_, index) =>
    String.fromCharCode(65 + index)
  );

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const topLeftCellRenderer = ({ style }) => (
    <Box
      style={{
        ...style,
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        zIndex: 3,
        width: stickyColumnWidth,
        height: rowHeight,
        lineHeight: `${rowHeight}px`,
        paddingLeft: 5,
        paddingTop: 5,
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {/* Empty */}
    </Box>
  );

  const headerCellRenderer = ({ columnIndex, style }) => (
    <Box
      style={{
        ...style,
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        zIndex: 2,
        width: columnIndex === 0 ? stickyColumnWidth : columnWidth,
        height: rowHeight,
        lineHeight: `${rowHeight}px`,
        paddingLeft: 5,
      }}
    >
      {columnIndex === 0 ? ' ' : columnNames[columnIndex - 1]}
    </Box>
  );

  const cellRenderer = ({ columnIndex, rowIndex, style }) => (
    <Box
      key={`cell-${rowIndex}-${columnIndex}`}
      style={{
        ...style,
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        zIndex: 1,
        width: columnIndex === 0 ? stickyColumnWidth : columnWidth,
        height: rowHeight,
        lineHeight: `${rowHeight}px`,
        paddingLeft: 5,
      }}
    >
      {columnIndex === 0 ? rowIndex : 'Data'}
    </Box>
  );

  const getColumnWidth = (index) => {
    if (index === 0) {
      return stickyColumnWidth;
    }
    return columnWidth;
  };

  const handleScroll = ({ scrollLeft, scrollTop }) => {
    setScrollLeft(scrollLeft);
    setScrollTop(scrollTop);
  };

  return (
    <Flex direction="column" alignItems="center" p={4}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: stickyColumnWidth, height: rowHeight }}>
          <Grid
            className="TopLeftGrid"
            columnCount={1}
            rowCount={1}
            columnWidth={getColumnWidth}
            rowHeight={() => rowHeight}
            width={stickyColumnWidth}
            height={rowHeight}
          >
            {topLeftCellRenderer}
          </Grid>
        </div>
        <div style={{ width: columnWidth * columnCount }}>
          <Grid
            className="HeaderGrid"
            columnCount={columnCount}
            rowCount={1}
            columnWidth={getColumnWidth}
            rowHeight={() => rowHeight}
            width={columnWidth * columnCount}
            height={rowHeight}
            onScroll={handleScroll}
          >
            {headerCellRenderer}
          </Grid>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: stickyColumnWidth, height: 500 }}>
          <Grid
            className="LeftColumnGrid"
            columnCount={1}
            rowCount={rowCount}
            columnWidth={getColumnWidth}
            rowHeight={() => rowHeight}
            width={stickyColumnWidth}
            height={500}
            onScroll={handleScroll}
          >
            {cellRenderer}
          </Grid>
        </div>
        <div style={{ flex: 1 }}>
          <Grid
            className="ContentGrid"
            columnCount={columnCount}
            rowCount={rowCount}
            columnWidth={getColumnWidth}
            rowHeight={() => rowHeight}
            width={columnWidth * columnCount}
            height={500}
            onScroll={handleScroll}
          >
            {cellRenderer}
          </Grid>
        </div>
      </div>
    </Flex>
  );
};

export default Spreadsheet;
