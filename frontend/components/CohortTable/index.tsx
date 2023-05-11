import 'remixicon/fonts/remixicon.css';
import React from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, Thead, Tbody, Tr, Th, Td, Flex, Text } from '@chakra-ui/react';
import TableSkeleton from '@components/Skeleton/TableSkeleton';

type CohortTableProps = {
  columns: ColumnDef<any, any>[];
  tableData: any[];
  isLoading: boolean;
  showTableCountHeader?: boolean;
  fetchMoreData?: Function;
  isMoreDataLoading?: boolean;
  setIsMoreDataLoading?: Function;
};

const CohortTable = ({ columns, tableData, isLoading }: CohortTableProps) => {
  const tableInstance = useReactTable({
    columns,
    data: tableData || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;
  const columnHeaders = columns.map((column) => column.header as string);

  return (
    <Flex
      alignItems={'center'}
      justifyContent={'space-between'}
      overflow={'scroll'}
    >
      {isLoading ? (
        <TableSkeleton tableHeader={columnHeaders} />
      ) : tableData?.length ? (
        <Table data-testid={'cohort-table'}>
          <Thead py={'3'} px={'8'} bg={'white.100'}>
            {getHeaderGroups().map((headerGroup, groupIndex) => (
              <Tr key={headerGroup.id + groupIndex}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <Th
                      key={header.id + index}
                      data-testid={'cohort-table-headers'}
                      bg={'white'}
                      paddingInline="0"
                      borderBottom={'none'}
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
                data-testid={'cohort-table-body-rows'}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  return (
                    <Td
                      key={cell.id + cellIndex}
                      data-testid={'cohort-table--body-data'}
                      fontSize={'xs-12'}
                      border="none"
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
  );
};

export default CohortTable;
