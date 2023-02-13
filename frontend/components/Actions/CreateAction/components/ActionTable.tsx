import ListingTable from '@components/ListingTable';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import EllipsisCell from '@components/EllipsisCell';
import { capitalizeFirstLetter } from '@lib/utils/common';
import EventType from './EventType';
dayjs.extend(utc);

type ActionTableProps = {
  isLoading: boolean;
  tableData: { count: number; data: any[] };
};

const ActionTable = ({ isLoading, tableData }: ActionTableProps) => {
  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('event', {
        header: 'Event',
        cell: (info) => <EventType value={info.getValue()} />,
      }),
      columnHelper.accessor('uid', {
        header: 'UI-ID',
        cell: (info) => <EllipsisCell value={info.getValue()} />,
      }),
      columnHelper.accessor('url', {
        header: 'URL/Screen',
        cell: (info) => <EllipsisCell value={info.getValue()} />,
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <EllipsisCell value={capitalizeFirstLetter(info.getValue())} />
        ),
      }),

      columnHelper.accessor('timestamp', {
        header: 'Time',
        cell: (info) => {
          const time = info.getValue() as Date;
          return (
            <EllipsisCell
              value={dayjs.utc(time).local().format('D MMM YY, h:mmA')}
            />
          );
        },
      }),
    ];
  }, []);

  return (
    <ListingTable
      isLoading={isLoading}
      count={tableData.count}
      tableData={tableData.data}
      columns={columns}
    />
  );
};

export default ActionTable;
