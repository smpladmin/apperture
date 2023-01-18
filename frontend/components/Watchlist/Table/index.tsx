import React, { useContext, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  Row,
} from '@tanstack/react-table';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import LabelType from './LabelType';
import Details from './Details';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { useRouter } from 'next/router';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppertureUser as User } from '@lib/domain/user';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const WatchlistTable = ({
  savedItemsData,
}: {
  savedItemsData: SavedItems[];
}) => {
  const router = useRouter();
  const {
    device: { isMobile },
  } = useContext(AppertureContext);

  const columnHelper = createColumnHelper<SavedItems>();
  const columns = useMemo(
    () =>
      isMobile
        ? [
            columnHelper.accessor('details', {
              header: 'Name',
              cell: (info) => <Details info={info} />,
            }),
          ]
        : [
            columnHelper.accessor('type', {
              header: 'Type',
              cell: (info) => <LabelType type={info.getValue()} />,
            }),
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
            columnHelper.accessor('details.updatedAt', {
              cell: (info) => {
                const updatedAt = info.getValue();
                return dayjs.utc(updatedAt).local().format('D MMM YY, h:mmA');
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

  const onRowClick = (row: Row<SavedItems>) => {
    if (row?.original?.type === WatchListItemType.FUNNELS) {
      const { _id } = row?.original?.details;
      router.push({
        pathname: '/analytics/funnel/view/[funnelId]',
        query: { funnelId: _id },
      });
    }
  };

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
            _hover={{ bg: 'gray.50', cursor: 'pointer' }}
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
