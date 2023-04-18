import React, { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import SelectBreakdown from './SelectBreakdown';
import { MetricTableData, Breakdown } from '@lib/domain/metric';

type MetricTableProps = {
  data: MetricTableData[];
  breakdown: string[];
  selectedBreakdowns: Breakdown[];
  setSelectedBreakdowns: Function;
};

const MetricTable = ({
  data,
  breakdown,
  selectedBreakdowns,
  setSelectedBreakdowns,
}: MetricTableProps) => {
  const columnHelper = createColumnHelper<MetricTableData>();
  const columns = useMemo(() => {
    const staticColumns = [
      columnHelper.accessor('name', {
        header: 'Metric',
        cell: (info) => info.getValue(),
      }),
    ];

    const hasBreakdown = data[0]?.propertyValue !== undefined;

    hasBreakdown &&
      staticColumns.push(
        columnHelper.accessor('propertyValue', {
          header: breakdown[0],
          cell: (info) => (
            <SelectBreakdown
              info={info}
              selectedBreakdowns={selectedBreakdowns}
              setSelectedBreakdowns={setSelectedBreakdowns}
            />
          ),
        })
      );

    staticColumns.push(
      columnHelper.accessor('average', {
        header: 'Average',
        cell: (info) => info.getValue(),
      })
    );

    const dynamicColumns =
      Object.keys(data?.[0]?.values).map((key: string) =>
        columnHelper.accessor(
          (row) => {
            return row.values[key];
          },
          {
            header: key,
            cell: (info) => {
              const value = +info.getValue();
              const roundedValue = Math.round(value * 100) / 100;
              return roundedValue;
            },
          }
        )
      ) || [];

    return [...staticColumns, ...dynamicColumns];
  }, [data, selectedBreakdowns]);

  const tableInstance = useReactTable({
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Box
      overflowX={'auto'}
      border={'1px'}
      borderRadius={'12'}
      borderColor={'grey.400'}
    >
      <Table bg={'white.DEFAULT'}>
        <Thead py={'3'} px={'8'} bg={'white.500'}>
          {getHeaderGroups().map((headerGroup, groupIndex) => (
            <Tr key={headerGroup.id + groupIndex} bg={'white.100'}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <Th
                    key={header.id + index}
                    data-testid={'metric-table-headers'}
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
        <Tbody>
          {getRowModel().rows.map((row, index) => (
            <Tr key={row.id + index} _hover={{ bg: 'white.100' }}>
              {row.getVisibleCells().map((cell, cellIndex) => {
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
    </Box>
  );
};

export default MetricTable;
