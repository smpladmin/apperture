import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { range } from 'lodash';
import React, { useRef, useState } from 'react';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

const Sheet = () => {
  const createRows = () => {
    const row = {} as { [key: string]: string };
    const singleRow = columns.forEach((column, i) => {
      row[String.fromCharCode(65 + column)] = `A${i}`;
    });
    return new Array(1000).fill(row);
  };

  const rows = range(1000);
  const columns = range(27);
  const tableRef = useRef(null);
  const [data, setData] = useState(createRows());
  const [showEditableCell, setShowEditableCell] = useState(false);
  const [editableCellStyle, setShowEditableCellStyle] = useState({});

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 36,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleDoubleClick = (event: any, row: number, col: string) => {
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

  return (
    <>
      <Table ref={tableRef} overflow={'auto'}>
        <Thead>
          <Tr position={'sticky'} top={0} zIndex={5}>
            {columns.map((el, i) =>
              i == 0 ? (
                <Th
                  key={i}
                  p={'0'}
                  border={0}
                  position={'sticky'}
                  top={0}
                  left={0}
                  zIndex={5}
                >
                  <Flex
                    height={7}
                    bg={'white.500'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    fontSize={'xs-10'}
                    lineHeight={'xs-10'}
                    color={'grey.600'}
                    fontWeight={'500'}
                    width={15}
                    borderColor={'grey.700'}
                    borderRightWidth={'0.4px'}
                    borderBottomWidth={'0.4px'}
                  ></Flex>
                </Th>
              ) : (
                <Th key={i} p={'0'} border={0}>
                  <Flex
                    height={7}
                    bg={'white.500'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    fontSize={'xs-10'}
                    lineHeight={'xs-10'}
                    color={'grey.600'}
                    fontWeight={'500'}
                    width={60}
                    borderColor={'grey.700'}
                    borderRightWidth={'0.4px'}
                    borderBottomWidth={'0.4px'}
                  >
                    {String.fromCharCode(65 + i - 1)}
                  </Flex>
                </Th>
              )
            )}
          </Tr>
        </Thead>
        <Tbody p={'0'}>
          {virtualItems.map((row, rowIndex) => {
            return (
              <Tr key={rowIndex}>
                <Td p={0} border={0} position={'sticky'} left={'0'}>
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
                  >
                    {rowIndex + 1}
                  </Flex>
                </Td>
                {Object.keys(data[rowIndex]).map((columnId, colIndex) => {
                  return (
                    <Td
                      p={0}
                      border={0}
                      tabIndex={0}
                      overflowX={'hidden'}
                      key={`${rowIndex}-${colIndex}`}
                      // contentEditable
                      // onBlur={(event) => handleCellChange(event, rowIndex, colIndex)}
                      // onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
                      onDoubleClick={(e) =>
                        handleDoubleClick(e, rowIndex, columnId)
                      }
                      // style={{
                      //   backgroundColor:
                      //     editedCell &&
                      //     editedCell.rowIndex === rowIndex &&
                      //     editedCell.colIndex === colIndex
                      //       ? '#f5f5f5'
                      //       : '',
                      //   padding: '8px',
                      //   border: '1px solid #ccc',
                      //   textAlign: 'left',
                      // }}
                    >
                      <Flex
                        w={60}
                        height={9}
                        borderRightWidth={'0.4px'}
                        borderBottomWidth={'0.4px'}
                        borderColor={'grey.700'}
                      >
                        {data[rowIndex][columnId]}
                      </Flex>
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
        {showEditableCell && (
          <Flex
            ref={(el) => el?.focus()}
            contentEditable
            position={'absolute'}
            style={editableCellStyle}
            zIndex={'99'}
            border={'1px solid blue'}
            bg={'white.DEFAULT'}
            alignItems={'center'}
            px={1}
            // onBlur={(e) => setShowEditableCell(false)}
          ></Flex>
        )}
      </Table>
    </>
  );
};

export default Sheet;
