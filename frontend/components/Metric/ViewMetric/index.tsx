import { Flex, useDisclosure } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateFilterObj } from '@lib/domain/common';
import {
  ComputedMetric,
  Metric,
  MetricSegmentFilter,
} from '@lib/domain/metric';
import { Notifications, NotificationVariant } from '@lib/domain/notification';
import { computeMetric } from '@lib/services/metricService';
import { getNotificationByReference } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { convertToTrendData, getCountOfSeries } from '../util';
import Alert from '@components/Alerts';
import ViewHeader from '@components/EventsLayout/ViewHeader';
import ViewMetricActionPanel from '../components/ViewMetricActionPanel';
import SavedMetricView from '../components/SavedMetricView';

const ViewMetric = ({
  savedMetric,
  savedNotification,
}: {
  savedMetric: Metric;
  savedNotification: Notifications;
}) => {
  const router = useRouter();
  const {
    pathname,
    query: { metricId, showAlert },
  } = router;

  const [computedMetric, setComputedMetric] = useState<ComputedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(savedNotification);
  const [isModalClosed, setIsModalClosed] = useState(false);
  const [dateFilter] = useState<DateFilterObj>({
    filter: savedMetric?.dateFilter?.filter || null,
    type: savedMetric?.dateFilter?.type || null,
  });
  const [segmentFilters] = useState<MetricSegmentFilter[] | null>(
    savedMetric?.segmentFilter || null
  );

  const { isOpen: isAlertsSheetOpen, onOpen, onClose } = useDisclosure();
  const [disableAlert, setDisableAlert] = useState(false);

  useEffect(() => {
    const fetchMetric = async () => {
      const result = await computeMetric(
        savedMetric.datasourceId,
        savedMetric.function ||
          savedMetric.aggregates.map((item) => item.variable).join(','),
        savedMetric.aggregates,
        savedMetric.breakdown,
        dateFilter,
        segmentFilters
      );
      setComputedMetric(result);
      setIsLoading(false);
    };
    fetchMetric();
  }, []);

  useEffect(() => {
    if (!isModalClosed) return;

    const getNotificationForMetric = async () => {
      const res =
        (await getNotificationByReference(
          savedMetric._id,
          savedMetric.datasourceId
        )) || {};
      setNotification(res);
    };
    getNotificationForMetric();
  }, [isModalClosed]);

  useEffect(() => {
    /* 
    - disable alerts if multiple series are present,
     in case of breakdown or multiple aggregates
    */
    if (getCountOfSeries(computedMetric) > 1) setDisableAlert(true);
  }, [computedMetric]);

  useEffect(() => {
    // open alerts modal when user gets redirected from
    // notification list page to view metric page
    if (showAlert) onOpen();
  }, []);

  const handleNotificationClick = () => {
    onOpen();
    router.replace({
      pathname,
      query: { ...router.query, showAlert: true },
    });
    setIsModalClosed(false);
  };

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

  const handleRedirectToEditMetric = () => {
    router.push({
      pathname: '/analytics/metric/edit/[metricId]',
      query: { metricId, dsId: savedMetric.datasourceId },
    });
  };

  const handleGoBack = () => {
    router.push({
      pathname: '/analytics/metric/list/[dsId]',
      query: { dsId: savedMetric.datasourceId },
    });
  };

  return (
    <Flex
      px={'5'}
      direction={'column'}
      h={'full'}
      bg={'white.400'}
      overflow={'auto'}
    >
      <ViewHeader
        name={savedMetric?.name}
        handleGoBack={handleGoBack}
        handleEditClick={handleRedirectToEditMetric}
        handleNotificationClick={handleNotificationClick}
        disableAlert={disableAlert}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        <ActionPanel>
          <ViewMetricActionPanel
            metricDefinition={savedMetric.function}
            aggregates={savedMetric.aggregates}
            breakdown={savedMetric.breakdown}
            segmentFilters={segmentFilters}
          />
        </ActionPanel>
        <ViewPanel>
          <SavedMetricView
            metric={computedMetric}
            isLoading={isLoading}
            breakdown={savedMetric.breakdown}
            dateFilter={dateFilter}
          />
        </ViewPanel>
      </Flex>
      <Alert
        name={savedMetric.name}
        isAlertsSheetOpen={isAlertsSheetOpen}
        closeAlertsSheet={handleCloseAlertsModal}
        variant={NotificationVariant.METRIC}
        reference={metricId as string}
        eventData={convertToTrendData(computedMetric) || []}
        datasourceId={savedMetric.datasourceId}
        savedAlert={notification}
      />
    </Flex>
  );
};

export default ViewMetric;
