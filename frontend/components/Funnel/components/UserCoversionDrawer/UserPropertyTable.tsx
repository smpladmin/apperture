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
import { UserProperty } from '@lib/domain/funnel';

type UserPropertyTableProps = {
  properties: any;
};

const UserPropertyTable = ({ properties }: UserPropertyTableProps) => {
  const columnHelper = createColumnHelper<UserProperty>();
  const columns = useMemo(() => {
    const generateColumnHeader = () => {
      return [
        columnHelper.accessor('Property', {
          header: 'Property',
          cell: (info) => (
            <Text wordBreak={'break-all'}>{info.getValue()}</Text>
          ),
        }),
        columnHelper.accessor('Value', {
          header: 'Value',
          cell: (info) => (
            <Text wordBreak={'break-all'}>{info.getValue()}</Text>
          ),
        }),
      ];
    };
    return [...generateColumnHeader()];
  }, [properties]);

  const tableInstance = useReactTable({
    columns,
    data: properties || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  if (properties.length === 0) {
    return (
      <Text
        textAlign={'center'}
        fontSize={'12px'}
        fontStyle={'italic'}
        color={'grey.100'}
      >
        No data available
      </Text>
    );
  }

  return (
    <Flex flexDirection="column" maxH={'full'} w={'full'} grow={1}>
      <Box
        overflowY={'auto'}
        border={'0.4px solid #b2b2b5'}
        borderRadius={'8px'}
        maxH={'full'}
        margin={2}
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

export default UserPropertyTable;
