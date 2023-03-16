import React, { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Flex,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Box,
  Text,
} from '@chakra-ui/react';
import { FunnelEventUserData } from '@lib/domain/funnel';
import { formatDatalabel } from '@lib/utils/common';
import UserRow from './UserRow';

type UserListTableProps = {
  users: FunnelEventUserData[];
  total_users: number;
  unique_users: number;
  handleRowClick: Function | null;
};

const UserListTable = ({
  users,
  total_users,
  unique_users,
  handleRowClick,
}: UserListTableProps) => {
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    const generateColumnHeader = () => {
      return ['id'].map((key: any) =>
        columnHelper.accessor(key, {
          header: 'Users',
          cell: (info) => (
            <UserRow name={info.getValue()} handleRowClick={handleRowClick} />
          ),
        })
      );
    };
    return [...generateColumnHeader()];
  }, [users]);

  const tableInstance = useReactTable({
    columns,
    data: users || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Flex flexDirection="column" maxH={'full'} w={'full'} grow={1}>
      <Flex justifyContent={'space-between'} py={4} maxH={'full'}>
        <Text
          flex={1}
          fontSize={14}
          lineHeight={'18px'}
          color={'grey.100'}
          fontWeight={500}
        >
          Showing:{' '}
          <Text as="span" color={'black.100'}>
            {total_users?.toLocaleString()} Users
          </Text>
        </Text>
        <Text
          fontSize={12}
          lineHeight={'16px'}
          color={'hover-grey'}
          fontWeight={400}
          textAlign={'right'}
        >
          Includes {formatDatalabel(unique_users)} Unique Users
        </Text>
      </Flex>
      <Box
        overflowY={'auto'}
        border={'0.4px solid #b2b2b5'}
        borderRadius={'8px'}
        maxH={'full'}
      >
        <Table>
          <Thead position={'sticky'} top={0} py={'3'} px={'8'} bg={'#f5f5f9'}>
            {getHeaderGroups().map((headerGroup, groupIndex) => (
              <Tr key={headerGroup.id + groupIndex}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <Th
                      key={header.id + index}
                      borderBottom={'0.4px solid #b2b2b5'}
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
          <Tbody overflow={'auto'}>
            {getRowModel().rows.map((row, index) => (
              <Tr key={row.id + index} _hover={{ bg: 'white.100' }}>
                {row.getVisibleCells().map((cell, cellIndex) => {
                  return (
                    <Td
                      key={cell.id + cellIndex}
                      borderBottom={'0.4px solid #b2b2b5'}
                      p={0}
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
    </Flex>
  );
};

export default UserListTable;
