import ListingTable from '@components/ListingTable';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import EllipsisCell from './EllipsisCell';
import { capitalizeFirstLetter } from '@lib/utils/common';
import EventType from './EventType';
import { ActionEventData, ActionMetaData } from '@lib/domain/action';
dayjs.extend(utc);

type ActionTableProps = {
  isLoading: boolean;
  tableData: ActionMetaData;
};

const ActionTable = ({ isLoading, tableData }: ActionTableProps) => {
  const columnHelper = createColumnHelper<ActionEventData>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('event', {
        header: 'Event',
        cell: (info) => <EventType value={info.getValue()} />,
      }),
      columnHelper.accessor('uid', {
        header: 'UI-ID',
        cell: (info) => <EllipsisCell>{info.getValue()}</EllipsisCell>,
      }),
      columnHelper.accessor('url', {
        header: 'URL/Screen',
        cell: (info) => <EllipsisCell>{info.getValue()}</EllipsisCell>,
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => (
          <EllipsisCell>{capitalizeFirstLetter(info.getValue())}</EllipsisCell>
        ),
      }),
      columnHelper.accessor('timestamp', {
        header: 'Time',
        cell: (info) => {
          const time = info.getValue() as Date;
          return (
            <EllipsisCell>
              {dayjs.utc(time).local().format('D MMM YY, h:mm:ss A')}
            </EllipsisCell>
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
