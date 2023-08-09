import { Flex } from '@chakra-ui/react';
import Sheet from '@components/AppertureSheets/grid';
import React, { useCallback } from 'react';

import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const Cell = ({ columnIndex, rowIndex, style }) => (
  <Flex
    bg={
      columnIndex % 2
        ? rowIndex % 2 === 0
          ? 'white.700'
          : 'white.DEFAULT'
        : rowIndex % 2
        ? 'white.700'
        : 'white.DEFAULT'
    }
    style={style}
  >
    r{rowIndex}, c{columnIndex}
  </Flex>
);

const Example = () => {
  const staticGrid = React.useRef(null);
  const onScroll = useCallback(({ scrollTop, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested) {
      staticGrid.current.scrollTo({ scrollLeft: 0, scrollTop });
    }
  }, []);
  return (
    <Flex height="full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <Flex direction={'row'} height={'100%'}>
              <Grid
                ref={staticGrid}
                style={{ overflowY: 'hidden' }}
                className="Grid"
                columnCount={2}
                columnWidth={100}
                height={height}
                rowCount={1000}
                rowHeight={35}
                width={600}
              >
                {Cell}
              </Grid>
              <Grid
                onScroll={onScroll}
                className="Grid"
                columnCount={1000}
                columnWidth={100}
                height={height}
                rowCount={1000}
                rowHeight={35}
                width={width}
              >
                {Cell}
              </Grid>
            </Flex>
          );
        }}
      </AutoSizer>
    </Flex>
  );
};

const AppertureSheet = () => {
  return <Example />;
};

export default AppertureSheet;
