import { Flex, Text } from '@chakra-ui/react';
import EllipsisCell from '@components/Actions/CreateAction/components/EllipsisCell';
import ListingTable from '@components/ListingTable';
import { UserActivity, UserActivityResponse } from '@lib/domain/funnel';
import { getUserActivity } from '@lib/services/datasourceService';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import React, { useMemo, useRef } from 'react';
dayjs.extend(utc);

type UserActivityTableProps = {
  isLoading: boolean;
  userActivity: UserActivityResponse;
  selectedUser: any;
  setUserActivity: Function;
};

const UserActivityTable = ({
  isLoading,
  userActivity,
  selectedUser,
  setUserActivity,
}: UserActivityTableProps) => {
  const router = useRouter();
  const { dsId } = router.query;

  const columnHelper = createColumnHelper<UserActivity>();
  const columns = useMemo(() => {
    const generateColumnHeader = () => {
      return [
        columnHelper.accessor('timestamp', {
          header: 'Time',
          cell: (info) => {
            const time = info.getValue() as Date;
            return (
              <EllipsisCell>
                {dayjs.utc(time).local().format('D MMM YY, h:mm:ssA')}
              </EllipsisCell>
            );
          },
        }),
        columnHelper.accessor('name', {
          header: 'Event',
          cell: (info) => (
            <Text
              fontWeight={400}
              fontSize={'14px'}
              lineHeight={'22px'}
              wordBreak={'break-all'}
            >
              {info.getValue()}
            </Text>
          ),
        }),
      ];
    };
    return [...generateColumnHeader()];
  }, [userActivity]);

  const page = useRef(1);
  const fetchMoreData = async () => {
    const res = await getUserActivity(
      selectedUser as string,
      dsId as string,
      page.current
    );
    setUserActivity({
      ...userActivity,
      data: [...userActivity.data, ...res.data],
    });
    page.current = page.current + 1;
  };

  return (
    <Flex direction={'column'} w={'full'}>
      <Text
        flex={1}
        fontSize={14}
        lineHeight={'18px'}
        color={'grey.100'}
        fontWeight={500}
      >
        Showing:{' '}
        <Text as="span" color={'black.100'}>
          {userActivity.count} Events
        </Text>
      </Text>
      <ListingTable
        columns={columns}
        tableData={userActivity.data}
        count={userActivity.count}
        isLoading={isLoading}
        showTableCountHeader={false}
        fetchMoreData={fetchMoreData}
      />
    </Flex>
  );
};

export default UserActivityTable;
