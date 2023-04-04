import { Text } from '@chakra-ui/react';
import ListingTable from '@components/ListingTable';
import { Clickstream } from '@lib/domain/clickstream';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMemo } from 'react';
import EventLabel from './EventLabel';
import TableCell from './TableCell';
import { trimLabel } from '@lib/utils/common';
dayjs.extend(utc);

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
                {dayjs.utc(info.getValue()).local().format('D MMM YY, h:mmA')}
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
