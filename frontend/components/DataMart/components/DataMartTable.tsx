import React, { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataMartTableData } from '@lib/domain/datamart';
import { SpreadSheetColumn } from '@lib/domain/workbook';
import ListingTable from '@components/ListingTable';

type DataMartTableProps = {
  data: any[];
  headers: SpreadSheetColumn[];
  loader: boolean;
};

const DataMartTable = ({ data, headers, loader }: DataMartTableProps) => {
  const columnHelper = createColumnHelper<DataMartTableData>();
  const columns = useMemo(() => {
    const dynamicColumns =
      headers.map((key: SpreadSheetColumn, idx: number) =>
        columnHelper.accessor(
          (row: any) => {
            return row[key.name];
          },
          {
            header: key.name,
            cell: (info) => {
              return info.getValue();
            },
          }
        )
      ) || [];

    return dynamicColumns;
  }, [data]);

  return (
    <ListingTable
      columns={columns}
      tableData={data}
      count={data.length}
      isLoading={loader}
    ></ListingTable>
  );
};

export default DataMartTable;
