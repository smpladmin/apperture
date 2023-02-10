import { Text } from '@chakra-ui/react';
import ListingTable from '@components/ListingTable';
import { Clickstream } from '@lib/domain/clickstream';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useMemo } from 'react';
import EventLabel from './EventLabel';
import TableCell from './TableCell';

export const trimLabel = (label: string, size = 15) => {
  return label.length > size + 3 ? label.slice(0, size) + '...' : label;
};

const StreamDataTable = ({
  count,
  tableData,
  isLoading,
}: {
  count: number;
  tableData: Clickstream[];
  isLoading: boolean;
}) => {
  const columnHelper = createColumnHelper<Clickstream>();

  const columns = useMemo(() => {
    const generateColumnHeader = () => {
      return [
        columnHelper.accessor('event', {
          header: 'event',
          cell: (info) => <EventLabel event={trimLabel(info.getValue())} />,
        }),
        columnHelper.accessor('uid', {
          header: 'u-id',
          cell: (info) => (
            <TableCell data-testid="uid-cell">
              {trimLabel(info.getValue())}
            </TableCell>
          ),
        }),
        columnHelper.accessor('url', {
          header: 'url/screen',
          cell: (info) => (
            <TableCell data-testid="url-cell">{info.getValue()}</TableCell>
          ),
        }),
        columnHelper.accessor('source', {
          header: 'source',
          cell: (info) => (
            <TableCell data-testid="source-cell">
              {trimLabel(info.getValue() || '')}
            </TableCell>
          ),
        }),
        columnHelper.accessor('timestamp', {
          header: 'time',
          cell: (info) => (
            <Text data-testid="timestamp-cell" whiteSpace={'nowrap'}>
              <TableCell>
                {format(new Date(info.getValue()), 'MMM d, yyyy')}
              </TableCell>
            </Text>
          ),
        }),
      ];
    };
    return [...generateColumnHeader()];
  }, [tableData]);
  return (
    <ListingTable
      count={count}
      columns={columns}
      tableData={tableData}
      isLoading={isLoading}
    />
  );
};

export default StreamDataTable;
