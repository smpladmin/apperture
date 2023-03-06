import {
  Button,
  Divider,
  Flex,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { BASTILLE } from '@theme/index';
import MetricViewComponentCard from './MetricViewComponentCard';
import ActionMenu from '@components/ActionMenu';
import {
  ComputedMetric,
  MetricAggregate,
  MetricTrend,
} from '@lib/domain/metric';
import { useRouter } from 'next/router';
import Alert from '@components/Alerts';
import { Notifications, NotificationVariant } from '@lib/domain/notification';
import { hasSavedAlert } from '@components/Alerts/util';
import { getCountOfSeries } from '@components/Metric/util';

const ViewMetricActionPanel = ({
  metricName,
  metricDefinition,
  aggregates,
  breakdown,
  datasourceId,
  eventData,
  savedNotification,
  setIsModalClosed,
  computedMetric,
}: {
  metricName: string;
  metricDefinition: string;
  aggregates: MetricAggregate[];
  breakdown: string[];
  datasourceId: string;
  eventData: MetricTrend[];
  savedNotification: Notifications;
  setIsModalClosed: Function;
  computedMetric: ComputedMetric[];
}) => {
  const router = useRouter();
  const {
    pathname,
    query: { metricId, showAlert },
  } = router;
  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();

  const [disableAlert, setDisableAlert] = useState(false);

  useEffect(() => {
    /* 
    - disable alerts if multiple series are present,
     in case of breakdown or multiple aggregates
    */
    if (getCountOfSeries(computedMetric) > 1) setDisableAlert(true);
  }, [computedMetric]);

  const handleNotificationClick = () => {
    onOpen();
    router.replace({
      pathname,
      query: { ...router.query, showAlert: true },
    });
    setIsModalClosed(false);
  };

  useEffect(() => {
    if (showAlert) onOpen();
  }, []);

  const handleCloseAlertsModal = () => {
    if (showAlert) {
      delete router.query.showAlert;
      router.replace({
        pathname,
        query: { ...router.query },
      });
    }
    onClose();
    setIsModalClosed(true);
  };

  return (
    <>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'primary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={() => {
            router.push({
              pathname: '/analytics/metric/list/[dsId]',
              query: { dsId: datasourceId },
            });
          }}
        />
        <Button
          borderRadius={'50'}
          bg={'black.300'}
          borderColor={'grey.300'}
          borderWidth={'1px'}
          color={'white'}
          variant={'primary'}
          data-testid={'edit-funnel'}
          onClick={() =>
            router.push({
              pathname: '/analytics/metric/edit/[id]',
              query: { id: router.query.metricId, dsId: datasourceId },
            })
          }
        >
          <Flex alignItems={'center'} gap={'1'}>
            <i className="ri-edit-fill"></i>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'medium'}
              color={'white'}
            >
              Edit
            </Text>
          </Flex>
        </Button>
      </Flex>

      <Flex direction={'column'} mt={'8'}>
        <Text
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
          data-testid={'metric-name'}
        >
          {metricName}
        </Text>
        <Text
          fontSize={{ base: 'sh-8', md: 'sh-8' }}
          lineHeight={{ base: 'sh-8', md: 'sh-8' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          borderColor={'grey.10'}
          px={0}
          py={2}
          data-testid={'metric-name'}
        >
          {metricDefinition}
        </Text>
      </Flex>

      <Flex direction={'column'} gap={3} mt={{ base: '2', md: '4' }}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontSize={'xs-12'} color={'grey.200'}>
            EVENTS & SEGMENT
          </Text>
        </Flex>
        {aggregates.map((aggregate) => (
          <MetricViewComponentCard
            variable={aggregate.variable}
            key={aggregate.variable}
            reference={aggregate.reference_id}
            filters={aggregate.filters}
            conditions={aggregate.conditions}
          />
        ))}
        <ActionMenu
          onNotificationClick={handleNotificationClick}
          hasSavedNotification={hasSavedAlert(savedNotification)}
          disableAlert={disableAlert}
        />
        <Divider
          mt={'4'}
          orientation="horizontal"
          borderColor={BASTILLE}
          opacity={1}
        />
        <Alert
          name={metricName}
          isAlertsSheetOpen={isAlertsSheetOpen}
          closeAlertsSheet={handleCloseAlertsModal}
          variant={NotificationVariant.METRIC}
          reference={metricId as string}
          eventData={eventData}
          datasourceId={datasourceId}
          savedAlert={savedNotification}
        />
      </Flex>
    </>
  );
};

export default ViewMetricActionPanel;
