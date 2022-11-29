import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import LabelType from './LabelType';
import TableActionMenu from './TableActionMenu';

const WatchlistTable = () => {
  const data: any[] = useMemo(
    () => [
      {
        type: 'event',
        name: 'Login',
        users: 120000,
        change: '10',
      },
      {
        type: 'event',
        name: 'Add_to_cart',
        users: 9000,
        change: '8',
      },
      {
        type: 'funnel',
        name: 'Otp_Funnel',
        users: 800,
        change: '2',
      },
      {
        type: 'funnel',
        name: 'Video_Funnel',
        users: 1890,
        change: '4',
      },
    ],
    []
  );

  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('type', {
        header: 'Type',
        enableSorting: false,
        cell: (info) => <LabelType info={info} />,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableSorting: false,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('users', {
        cell: (info) => info.getValue(),
        enableSorting: true,
        header: 'Users',
      }),
      columnHelper.accessor('change', {
        cell: (info) => info.getValue(),
        enableSorting: false,
        header: '% Change',
      }),
      columnHelper.accessor('actions', {
        cell: (info) => <TableActionMenu />,
        enableSorting: false,
        header: '',
      }),
    ],
    []
  );

  const tableInstance = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Table>
      <Thead py={'3'} px={'8'} bg={'white.100'}>
        {getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Th key={header.id}>
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
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              return (
                <Td key={cell.id}>
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

export default WatchlistTable;
