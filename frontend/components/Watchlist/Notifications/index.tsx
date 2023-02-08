import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext, createColumnHelper, Row } from '@tanstack/react-table';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import WatchlistTable from '../Table';
import LoadingSpinner from '@components/LoadingSpinner';
import { getSavedNotificationsForDatasourceId } from '@lib/services/notificationService';
import {
  AlertAndUpdate,
  NotificationType,
  NotificationVariant,
  NotificationWithUser,
} from '@lib/domain/notification';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import NotificationActive from '../Table/NotificationActive';
import LabelType from '../Table/LabelType';
import EntityType from '../Table/EntityType';
dayjs.extend(utc);

const SavedNotifications = () => {
  const [notifications, setNotifications] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { dsId } = router.query;

  useEffect(() => {
    const getNotifications = async () => {
      let savedNotifications =
        (await getSavedNotificationsForDatasourceId(dsId as string)) || [];
      savedNotifications = savedNotifications.map(
        (notification: NotificationWithUser) => {
          return { type: notification.notificationType, details: notification };
        }
      );
      setNotifications(savedNotifications);
      setIsLoading(false);
    };

    setIsLoading(true);
    getNotifications();
  }, []);

  const columnHelper = createColumnHelper<SavedItems>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info: CellContext<SavedItems, NotificationType[]>) => {
          const type = info.getValue().join(',') as
            | NotificationType
            | AlertAndUpdate;
          return <LabelType type={type} />;
        },
      }),
      columnHelper.accessor('details.name', {
        cell: (info) => <EntityType info={info} />,
        header: 'Entity',
      }),
      columnHelper.accessor('details.createdAt', {
        cell: (info) => {
          const updatedAt = info.getValue() as Date;
          return dayjs.utc(updatedAt).local().format('D MMM YY, h:mmA');
        },
        header: 'Created On',
      }),
      columnHelper.accessor('details.notificationActive', {
        header: 'Active',
        cell: (info: CellContext<SavedItems, boolean>) => (
          <NotificationActive info={info} />
        ),
      }),
    ];
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { reference, datasourceId, variant } = row.original
      .details as NotificationWithUser;

    if (variant === NotificationVariant.NODE) return;

    const path = NotificationVariant.toURLPath(variant);
    router.push({
      pathname: `/analytics/${path}/[id]`,
      query: { id: reference, dsId: datasourceId, showAlert: true },
    });
  };

  return (
    <Box px={{ base: '4', md: '30' }} py={'13'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
          {'Alerts & Updates'}
        </Text>
        <Button variant={'primary'} bg={'black.100'} px={'6'} py={'4'}>
          <Text
            color={'white.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            {'Configure'}
          </Text>
        </Button>
      </Flex>

      <Box mt={'7'}>
        {isLoading ? (
          <Flex
            w={'full'}
            h={'full'}
            minH={'80'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <LoadingSpinner />
          </Flex>
        ) : (
          <WatchlistTable
            savedItemsData={notifications}
            onRowClick={onRowClick}
            tableColumns={columns}
          />
        )}
      </Box>
    </Box>
  );
};

export default SavedNotifications;
