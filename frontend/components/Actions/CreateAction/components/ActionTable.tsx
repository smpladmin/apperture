import ListingTable from '@components/ListingTable';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useMemo } from 'react';

const ActionTable = () => {
  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('event', {
        header: 'Event',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('user_id', {
        header: 'UI-ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('timestamp', {
        header: 'Time',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('timestamp', {
        header: 'Time',
        cell: (info) => info.getValue(),
      }),
    ];
  }, []);

  return (
    <ListingTable
      isLoading={false}
      count={1}
      tableData={[
        {
          event: 'Autocapture',
          user_id: '232e23rfjsdf',
          source: 'apperture',
          timestamp: '20221212',
        },
      ]}
      columns={columns}
    />
  );
};

export default ActionTable;
