import React, { useContext, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import Details from './Details';
import { SavedItems } from '@lib/domain/watchlist';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppertureUser as User } from '@lib/domain/user';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import UserInfo from './UserInfo';
dayjs.extend(utc);

type WatchlistTableProps = {
  savedItemsData: SavedItems[];
  onRowClick: Function;
  tableColumns?: ColumnDef<SavedItems, any>[];
};

const WatchlistTable = ({
  savedItemsData,
  onRowClick,
  tableColumns,
}: WatchlistTableProps) => {
  const {
    device: { isMobile },
  } = useContext(AppertureContext);

  const columnHelper = createColumnHelper<SavedItems>();
  const columns = tableColumns
    ? tableColumns
    : useMemo(
        () =>
          isMobile
            ? [
                columnHelper.accessor('details', {
                  header: 'Name',
                  cell: (info) => <Details info={info} />,
                }),
                columnHelper.accessor('details.user', {
                  cell: (info) => {
                    const user = info.getValue() as User;
                    return `${user.firstName} ${user.lastName}`;
                  },
                  header: 'Created By',
                }),
              ]
            : [
                columnHelper.accessor('details', {
                  header: 'Name',
                  cell: (info) => <Details info={info} />,
                }),
                columnHelper.accessor('details.user', {
                  cell: (info) => <UserInfo info={info} />,
                  header: 'Created By',
                }),
                columnHelper.accessor('details.updatedAt', {
                  cell: (info) => {
                    const updatedAt = info.getValue() as Date;
                    return dayjs
                      .utc(updatedAt)
                      .local()
                      .format('D MMM YY, h:mmA');
                  },
                  header: 'Last Updated',
                }),
              ],
        []
      );

  const tableInstance = useReactTable({
    columns,
    data: savedItemsData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
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
            onClick={() => onRowClick(row)}
            _hover={{ bg: 'white.100', cursor: 'pointer' }}
            data-testid={'table-body-rows'}
          >
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
