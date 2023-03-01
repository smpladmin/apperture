import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { ComputedMetric, Metric } from '@lib/domain/metric';
import { Notifications } from '@lib/domain/notification';
import { computeMetric } from '@lib/services/metricService';
import { getNotificationByReference } from '@lib/services/notificationService';
import React, { useEffect, useState } from 'react';
import { convertToTrendData } from '../util';
import SavedMetricView from './Components/SavedMetricView';
import ViewMetricActionPanel from './Components/ViewMetricActionPanel';

const ViewMetric = ({
  savedMetric,
  savedNotification,
}: {
  savedMetric: Metric;
  savedNotification: Notifications;
}) => {
  const [metric, setMetric] = useState<ComputedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(savedNotification);
  const [isModalClosed, setIsModalClosed] = useState(false);

  useEffect(() => {
    const fetchMetric = async () => {
      const result = await computeMetric(
        savedMetric.datasourceId,
        savedMetric.function ||
          savedMetric.aggregates.map((item) => item.variable).join(','),
        savedMetric.aggregates,
        savedMetric.breakdown,
        undefined,
        undefined
      );
      setMetric(result);
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
          breakdown={savedMetric?.breakdown}
          datasourceId={savedMetric.datasourceId}
          eventData={convertToTrendData(metric) || []}
          savedNotification={notification}
          setIsModalClosed={setIsModalClosed}
        />
      </ActionPanel>
      <ViewPanel>
        <SavedMetricView
          metric={metric}
          isLoading={isLoading}
          breakdown={savedMetric?.breakdown}
        />
      </ViewPanel>
    </Flex>
  );
};

export default ViewMetric;
