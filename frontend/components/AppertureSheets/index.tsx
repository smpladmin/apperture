import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { range } from 'lodash';
import React, { useRef, useState } from 'react';

const Sheet = () => {
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
  const [data, setData] = useState(createRows());

  return (
    <>
      <Table ref={tableRef} overflow={'auto'}>
        <Thead>
          <Tr position={'sticky'} top={'0'}>
            {columns.map((el, i) => (
              <Th p={'0'} border={0}>
                <Flex
                  height={7}
                  bg={'white.500'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  fontSize={'xs-10'}
                  lineHeight={'xs-10'}
                  color={'grey.600'}
                  fontWeight={'500'}
                  width={i === 0 ? 15 : 60}
                  borderColor={'grey.700'}
                  borderRightWidth={'0.4px'}
                  borderBottomWidth={'0.4px'}
                >
                  {/* 1 as offset for index */}
                  {i === 0 ? '' : String.fromCharCode(65 + el - 1)}
                </Flex>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody p={'0'}>
          {data.map((row, rowIndex) => (
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
              {Object.keys(row).map((columnId, colIndex) => (
                <Td
                  p={0}
                  border={0}
                  tabIndex={0}
                  overflowX={'hidden'}
                  key={`${rowIndex}-${colIndex}`}
                  // contentEditable
                  // onBlur={(event) => handleCellChange(event, rowIndex, colIndex)}
                  // onKeyDown={(event) => handleKeyDown(event, rowIndex, colIndex)}
                  // onDoubleClick={(e) => handleDoubleClick(e, rowIndex, colIndex)}
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
                    {row[columnId]}
                  </Flex>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
        {/* {showEditableCell && (
        <Box
          ref={(el) => el?.focus()}
          contentEditable
          position={'absolute'}
          style={editableCellStyle}
          zIndex={'99'}
          border={'1px solid blue'}
          max
        ></Box>
      )} */}
      </Table>
    </>
  );
};

export default Sheet;
