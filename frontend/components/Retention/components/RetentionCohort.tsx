import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import CohortTable from '@components/CohortTable';
import TableCell from '@components/DataStream/Components/TableCell';
import { Flex } from '@chakra-ui/react';
import { RetentionCohortData } from '@lib/domain/retention';
import { getUTCFormmatedDate } from '@lib/utils/common';

type RetentionCohortProps = {
  isLoading: boolean;
  tableData: any[];
};

export const RetentionCohort = ({
  isLoading,
  tableData,
}: RetentionCohortProps) => {
  const columnHelper = createColumnHelper<RetentionCohortData>();

  const columns = useMemo(() => {
    const staticColumns = [
      columnHelper.accessor('cohort', {
        header: (info) => {
          return (
            <Flex
              whiteSpace={'nowrap'}
              textTransform={'capitalize'}
              paddingInline={4}
              paddingBlock={2}
            >
              {info?.header?.id}
            </Flex>
          );
        },
        cell: (info) => {
          const date = info.getValue();
          return (
            <TableCell
              maxWidth={'55'}
              whiteSpace={'nowrap'}
              fontSize={'xs-12'}
              lineHeight={'base'}
              fontWeight={'400'}
            >
              {getUTCFormmatedDate(date, 'MMM D')}
            </TableCell>
          );
        },
      }),
      columnHelper.accessor('size', {
        header: (info) => {
          return (
            <Flex
              whiteSpace={'nowrap'}
              textTransform={'capitalize'}
              paddingInline={4}
              paddingBlock={2}
              borderLeft={'1px solid #ededed'}
            >
              {info?.header?.id}
            </Flex>
          );
        },
        cell: (info) => (
          <TableCell
            maxWidth={'55'}
            fontSize={'xs-12'}
            lineHeight={'base'}
            fontWeight={'400'}
          >
            {info.getValue()}
          </TableCell>
        ),
      }),
    ];

    const intervals = tableData?.[0]?.intervals || {};
    const dynamicColumns = Object.keys(intervals).map((key: string) =>
      columnHelper.accessor(
        (row) => {
          return row.intervals[key];
        },
        {
          id: key,
          header: (info) => {
            return (
              <Flex
                whiteSpace={'nowrap'}
                textTransform={'capitalize'}
                paddingInline={4}
                paddingBlock={2}
                borderLeft={'1px solid #ededed'}
              >
                {info?.header?.id}
              </Flex>
            );
          },
          cell: (info) => {
            return info.getValue() ? `${info.getValue()}%` : '';
          },
        }
      )
    );
    return [...staticColumns, ...dynamicColumns];
  }, []);

  return (
    <CohortTable
      isLoading={isLoading}
      tableData={tableData}
      columns={columns}
    />
  );
};
