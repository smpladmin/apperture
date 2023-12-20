import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { DataMartTableData } from '@lib/domain/datamart';
import { SpreadSheetColumn } from '@lib/domain/workbook';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import LoadingSpinner from '@components/LoadingSpinner';

type DataMartTableProps = {
  data: any[];
  headers: SpreadSheetColumn[];
  loading: boolean;
};

const DataMartTable = ({ data, headers, loading }: DataMartTableProps) => {
  const columnHelper = createColumnHelper<DataMartTableData>();
  const columns = useMemo(() => {
    const dynamicColumns =
      headers.map((key: SpreadSheetColumn, idx: number) =>
        columnHelper.accessor(
          (row: any) => {
            return row[key.name];
          },
          {
            header: key.name,
            cell: (info) => {
              return info.getValue();
            },
          }
        )
      ) || [];

    return dynamicColumns;
  }, [data, headers]);

  const tableInstance = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Box overflow={'scroll'}>
      <Flex
        w={'full'}
        pl={'5'}
        py={'1'}
        fontSize={'xs-12'}
        fontWeight={'500'}
        lineHeight={'xs-12'}
        color={'grey.900'}
        gap={'2'}
        alignItems={'center'}
        h={'7'}
      >
        {`Data`}
        <Text
          fontSize={'xs-12'}
          fontWeight={'500'}
          lineHeight={'xs-12'}
          color={'grey.800'}
        >{`Showing ${data.length} rows`}</Text>
      </Flex>
      {loading ? (
        <Flex
          w={'full'}
          h={'full'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <LoadingSpinner size={'xl'} />
        </Flex>
      ) : (
        <Table data-testid={'datamart-table'}>
          <Thead
            bg={'white.200'}
            borderTopWidth={'1px'}
            borderTopColor={'white.200'}
          >
            {getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <Th
                      key={header.id}
                      data-testid={'data-table'}
                      fontSize={'xs-10'}
                      fontWeight={'700'}
                      lineHeight={'lh-135'}
                      textTransform={'capitalize'}
                      letterSpacing={0}
                      color={'grey.800'}
                      px={'3'}
                      py={'3'}
                      maxWidth={'60'}
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
            {getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                _hover={{ bg: 'white.100', cursor: 'pointer' }}
                data-testid={'table-body-rows'}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td
                      key={cell.id}
                      px={3}
                      py={'3'}
                      maxWidth={'60'}
                      fontSize={'xs-12'}
                      fontWeight={'500'}
                      lineHeight={'xs-12'}
                      color={'grey.800'}
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
      )}
    </Box>
  );
};

export default DataMartTable;
