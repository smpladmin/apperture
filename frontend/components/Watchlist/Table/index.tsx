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
import TableActionMenu from './ActionMenu';
import Details from './Details';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { useRouter } from 'next/router';
import UsersMetric from './UsersMetric';
import { AppertureContext } from '@lib/contexts/appertureContext';

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
            columnHelper.accessor('users', {
              cell: (info) => <UsersMetric info={info} />,
              header: 'Users',
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
            columnHelper.accessor('users', {
              cell: (info) => <UsersMetric info={info} />,
              header: 'Users',
            }),
            columnHelper.accessor('change', {
              cell: (info) => info.getValue(),
              header: '% Change',
            }),
            columnHelper.accessor('actions', {
              cell: () => <TableActionMenu />,
              header: '',
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
          <Tr
            key={row.id}
            onClick={() => onRowClick(row)}
            _hover={{ bg: 'white.100' }}
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
