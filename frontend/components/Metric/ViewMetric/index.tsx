import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateFilter, DateFilterType, DateFilterObj } from '@lib/domain/common';
import { ComputedMetric, Metric } from '@lib/domain/metric';
import { Notifications } from '@lib/domain/notification';
import { computeMetric } from '@lib/services/metricService';
import { getNotificationByReference } from '@lib/services/notificationService';
import React, { useEffect, useState } from 'react';
import { convertToTrendData } from '../util';
import SavedMetricView from './components/SavedMetricView';
import ViewMetricActionPanel from './components/ViewMetricActionPanel';

const ViewMetric = ({
  savedMetric,
  savedNotification,
}: {
  savedMetric: Metric;
  savedNotification: Notifications;
}) => {
  const [computedMetric, setComputedMetric] = useState<ComputedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(savedNotification);
  const [isModalClosed, setIsModalClosed] = useState(false);
  const [dateFilter] = useState<DateFilterObj>({
    filter: savedMetric?.dateFilter?.filter || null,
    type: savedMetric?.dateFilter?.type || null,
  });

  useEffect(() => {
    const fetchMetric = async () => {
      const result = await computeMetric(
        savedMetric.datasourceId,
        savedMetric.function ||
          savedMetric.aggregates.map((item) => item.variable).join(','),
        savedMetric.aggregates,
        savedMetric.breakdown,
        dateFilter
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

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <ViewMetricActionPanel
          metricDefinition={savedMetric.function}
          metricName={savedMetric.name}
          aggregates={savedMetric.aggregates}
          breakdown={savedMetric.breakdown}
          datasourceId={savedMetric.datasourceId}
          eventData={convertToTrendData(computedMetric) || []}
          savedNotification={notification}
          setIsModalClosed={setIsModalClosed}
          computedMetric={computedMetric}
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
  );
};

export default ViewMetric;
