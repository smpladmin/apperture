import 'remixicon/fonts/remixicon.css';
import React, { useEffect, useRef } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
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
import LoadingSpinner from '@components/LoadingSpinner';

type ListingTableProps = {
  columns: ColumnDef<any, any>[];
  tableData: any[];
  count: number;
  isLoading: boolean;
  showTableCountHeader?: boolean;
  fetchMoreData?: Function;
  isMoreDataLoading?: boolean;
  setIsMoreDataLoading?: Function;
};

const ListingTable = ({
  columns,
  tableData,
  isLoading,
  count,
  showTableCountHeader = true,
  fetchMoreData,
  isMoreDataLoading,
  setIsMoreDataLoading,
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
      overflow={'scroll'}
    >
      {showTableCountHeader && (
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
                {count || 0} Events
              </Text>
            )}
          </Flex>
        </Flex>
      )}
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        {isLoading ? (
          <TableSkeleton tableHeader={columnHeaders} />
        ) : tableData?.length ? (
          <Table data-testid={'listing-table'}>
            <Thead py={'3'} px={'8'} bg={'white.100'}>
              {getHeaderGroups().map((headerGroup, groupIndex) => (
                <Tr key={headerGroup.id + groupIndex}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <Th
                        key={header.id + index}
                        data-testid={'listing-table-headers'}
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
              {getRowModel().rows.map((row, index) =>
                fetchMoreData ? (
                  <PaginatedTableRow
                    row={row}
                    key={row.id + index}
                    index={index}
                    isLast={index === tableData.length - 1}
                    fetchMoreData={fetchMoreData}
                    hasMore={tableData.length < count}
                    setIsMoreDataLoading={setIsMoreDataLoading}
                  ></PaginatedTableRow>
                ) : (
                  <Tr
                    key={row.id + index}
                    _hover={{ bg: 'white.100' }}
                    data-testid={'listing-table-body-rows'}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      return (
                        <Td
                          key={cell.id + cellIndex}
                          data-testid={'listing-table--body-data'}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                )
              )}
              {isMoreDataLoading && (
                <Tr>
                  <Td>
                    <Flex w={'full'} justifyContent={'right'}>
                      <LoadingSpinner />
                    </Flex>
                  </Td>
                </Tr>
              )}
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

type PaginatedTableRowProps = {
  row: any;
  index: number;
  isLast: boolean;
  fetchMoreData: Function;
  hasMore: boolean;
  setIsMoreDataLoading?: Function;
};

const PaginatedTableRow = (props: PaginatedTableRowProps) => {
  const cardRef = useRef(null);
  useEffect(() => {
    if (!cardRef?.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (props.isLast && entry.isIntersecting && props.hasMore) {
        props.setIsMoreDataLoading?.(true);
        props.fetchMoreData();

        observer.unobserve(entry.target);
      }
    });

    observer.observe(cardRef.current);
  }, [props.isLast]);

  return (
    <Tr
      ref={cardRef}
      key={props.row.id + props.index}
      _hover={{ bg: 'white.100' }}
      data-testid={'listing-table-body-rows'}
    >
      {props.row.getVisibleCells().map((cell: any, cellIndex: number) => {
        return (
          <Td
            key={cell.id + cellIndex}
            data-testid={'listing-table--body-data'}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </Td>
        );
      })}
    </Tr>
  );
};

export default ListingTable;
