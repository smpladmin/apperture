import React, { useMemo, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  Row,
} from '@tanstack/react-table';
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import EditColumns from './EditColumns';

const SegmentTable = ({
  eventProperties,
  selectedColumns,
  setSelectedColumns,
  userTableData,
  isSegmentDataLoading,
}: any) => {
  const columnHelper = createColumnHelper();

  const generateColumnHeader = () => {
    return selectedColumns.map((key: any) =>
      columnHelper.accessor(key, {
        header: key,
        cell: (info) => {
          try {
            //@ts-ignore
            const accessorKey = info?.column?.columnDef?.accessorKey;
            const index = info?.row?.index;
            if (
              accessorKey &&
              accessorKey.includes('.') &&
              index !== undefined
            ) {
              return userTableData.data[index][accessorKey];
            }
            return info.getValue();
          } catch (err) {
            return '-';
          }
        },
      })
    );
  };
  const columns = useMemo(
    () => [...generateColumnHeader()],
    [selectedColumns, userTableData]
  );
  const tableInstance = useReactTable({
    columns,
    data: userTableData?.data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;

  if (isSegmentDataLoading) {
    return <p>Loading...</p>;
  }

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
          <Text fontSize={'xs-14'} lineHeight={'xs-18'} fontWeight={'500'}>
            {userTableData.count || 0} Users
          </Text>
        </Flex>
        <Flex gap={'1'}>
          <Button variant={'secondary'} bg={'none'} gap={2}>
            <i className="ri-upload-2-line"></i>
            <Text fontSize={'xs-14'} fontWeight={500}>
              Export
            </Text>
          </Button>
          <EditColumns
            eventProperties={eventProperties}
            setSelectedColumns={setSelectedColumns}
            selectedColumns={selectedColumns}
          />
        </Flex>
      </Flex>

      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        overflow={'auto'}
      >
        <Table data-testid={'watchlist-table'}>
          <Thead py={'3'} px={'8'} bg={'white.100'}>
            {getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} data-testid={'watchlist-table-headers'}>
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
                _hover={{ bg: 'white.100' }}
                data-testid={'table-body-rows'}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td key={cell.id}>
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
      </Flex>
    </Box>
  );
};

export default SegmentTable;
