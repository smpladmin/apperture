import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { ComputedMetric, Metric } from '@lib/domain/metric';
import { Notifications } from '@lib/domain/notification';
import { computeMetric } from '@lib/services/metricService';
import React, { useEffect, useState } from 'react';
import SavedMetricView from './Components/SavedMetricView';
import ViewMetricActionPanel from './Components/ViewMetricActionPanel';

const ViewMetric = ({
  savedMetric,
  savedNotification,
}: {
  savedMetric: Metric;
  savedNotification: Notifications;
}) => {
  const [computedMetric, setComputedMetric] = useState<ComputedMetric | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  console.log(savedNotification);
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
      setComputedMetric({
        data: result.metric,
        definition: savedMetric.function,
        average: result.average,
      });
      setIsLoading(false);
    };
    fetchMetric();
  }, []);

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <ViewMetricActionPanel
          metricDefinition={savedMetric.function}
          metricName={savedMetric.name}
          aggregates={savedMetric.aggregates}
          datasourceId={savedMetric.datasourceId}
          eventData={computedMetric?.data || []}
          savedNotification={savedNotification}
        />
      </ActionPanel>
      <ViewPanel>
        <SavedMetricView metric={computedMetric} isLoading={isLoading} />
      </ViewPanel>
    </Flex>
  );
};

export default ViewMetric;
