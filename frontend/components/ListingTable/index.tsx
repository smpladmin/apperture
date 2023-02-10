import React, { useMemo } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import TableSkeleton from '@components/Skeleton/TableSkeleton';

type ListingTableProps = {
  columns: ColumnDef<any, any>[];
  tableData: any[];
  count: number;
  isLoading: boolean;
};

const ListingTable = ({
  columns,
  tableData,
  isLoading,
  count,
}: ListingTableProps) => {
  const tableInstance = useReactTable({
    columns,
    data: tableData || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;
  const columnHeaders = columns.map((column) => column.header as string);

  return (
    <Box
      borderRadius={'12'}
      mt={'4'}
      borderWidth={'0.4px'}
      borderColor={'grey.100'}
    >
      <Flex
        minH={'15'}
        p={'4'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={'100%'}
      >
        <Flex gap={'1'}>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-18'}
            fontWeight={'500'}
            color={'grey.100'}
          >
            Showing:
          </Text>
          {isLoading ? (
            <Skeleton height={'5'} />
          ) : (
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-18'}
              fontWeight={'500'}
              data-testid={'users-count'}
            >
              {count || 0} Users
            </Text>
          )}
        </Flex>
      </Flex>

      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        overflow={'auto'}
      >
        {isLoading ? (
          <TableSkeleton tableHeader={columnHeaders} />
        ) : tableData?.length ? (
          <Table data-testid={'segment-table'}>
            <Thead py={'3'} px={'8'} bg={'white.100'}>
              {getHeaderGroups().map((headerGroup, groupIndex) => (
                <Tr key={headerGroup.id + groupIndex}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <Th
                        key={header.id + index}
                        data-testid={'segment-table-headers'}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {getRowModel().rows.map((row, index) => (
                <Tr
                  key={row.id + index}
                  _hover={{ bg: 'white.100' }}
                  data-testid={'segment-table-body-rows'}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    return (
                      <Td
                        key={cell.id + cellIndex}
                        data-testid={'segment-table--body-data'}
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
        ) : (
          <Flex w={'full'} justifyContent={'center'} py={'2'}>
            <Text fontSize={'xs-14'} lineHeight={'xs-18'} fontWeight={'500'}>
              No data found
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default ListingTable;
