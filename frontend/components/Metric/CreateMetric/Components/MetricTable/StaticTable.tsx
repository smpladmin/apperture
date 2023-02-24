import React, { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
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

const StaticTable = ({ data }: any) => {
  console.group('metric table', data);
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => {
    const staticColumns = [
      columnHelper.accessor('name', {
        header: 'Series',
        cell: (info) => info.getValue(),
        enableRowSpan: true,
      }),
      columnHelper.accessor('propertyValue', {
        header: 'Breakdown',
        cell: (info) => info.getValue(),
      }),
    ];

    return [...staticColumns];
  }, []);

  const tableInstance = useReactTable({
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Table w="min-content">
      <Thead position={'sticky'} top={0} py={'3'} px={'8'} bg={'#f5f5f9'}>
        {getHeaderGroups().map((headerGroup, groupIndex) => (
          <Tr key={headerGroup.id + groupIndex} bg={'white.100'}>
            {headerGroup.headers.slice(0, 2).map((header, index) => {
              return (
                <Th
                  key={header.id + index}
                  borderBottom={'0.4px solid #b2b2b5'}
                  py={3}
                  paddingLeft={8}
                  onClick={
                    header.column.columnDef.header == 'average'
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  cursor={
                    header.column.columnDef.header == 'average'
                      ? 'pointer'
                      : 'inherit'
                  }
                >
                  <Flex
                    whiteSpace={'nowrap'}
                    fontSize={'xs-12'}
                    fontWeight={400}
                    gap={1}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.columnDef.header == 'average'
                      ? {
                          asc: <i className="ri-sort-asc" />,
                          desc: <i className="ri-sort-desc" />,
                        }[header.column.getIsSorted() as string] ?? null
                      : null}
                  </Flex>
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
              .slice(0, 2)
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default StaticTable;

// const generateColumnHeader = () => {
//   return Object.keys(data[0]).map((key: any) =>
//     columnHelper.accessor(key, {
//       header: key,
//       cell: (info) => info.getValue(),
//     })
//   );
// };
// return [...generateColumnHeader()];
