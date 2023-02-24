import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const DynamicTable = ({ data }: any) => {
  console.log('dynamic');
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    const dynamicColumns =
      Object.keys(data?.[0].values).map((key: any) =>
        columnHelper.accessor(key, {
          header: key,
          cell: (info) => info.getValue(),
        })
      ) || [];

    return [...dynamicColumns];
  }, [data]);

  const tableData = useMemo(() => data.map((d: any) => d.values), [data]);

  const tableInstance = useReactTable({
    columns,
    data: tableData || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;
  return (
    <Box overflow={'auto'} w="full">
      <Table w="full">
        <Thead position={'sticky'} top={0} py={'3'} px={'8'} bg={'#f5f5f9'}>
          {getHeaderGroups().map((headerGroup, groupIndex) => (
            <Tr key={headerGroup.id + groupIndex} bg={'white.100'}>
              {headerGroup.headers.slice(2).map((header, index) => {
                return (
                  <Th
                    key={header.id + index}
                    borderBottom={'0.4px solid #b2b2b5'}
                    py={3}
                    paddingLeft={8}
                  >
                    <Text
                      whiteSpace={'nowrap'}
                      fontSize={'xs-12'}
                      fontWeight={400}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </Text>
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody overflow={'auto'}>
          {getRowModel().rows.map((row, index) => (
            <Tr key={row.id + index} _hover={{ bg: 'white.100' }}>
              {row
                .getVisibleCells()
                .slice(2)
                .map((cell, cellIndex) => {
                  return (
                    <Td
                      key={cell.id + cellIndex}
                      borderBottom={'0.4px solid #b2b2b5'}
                      py={3}
                      paddingLeft={8}
                      fontSize={'xs-14'}
                      fontWeight={500}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Td>
                  );
                })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DynamicTable;
