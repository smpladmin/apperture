import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateRangeType, ComputedMetric, Metric } from '@lib/domain/metric';
import React, { useState } from 'react';
import CreateMetricAction from './Components/CreateMetricAction';
import TransientMetricView from './Components/TransientMetricView';

const Metric = ({ savedMetric }: { savedMetric?: Metric | undefined }) => {
  const [metric, setMetric] = useState<ComputedMetric | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType | null>(null);
  const [canSaveMetric, setCanSaveMetric] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(savedMetric));
  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateMetricAction
          setMetric={setMetric}
          dateRange={dateRange}
          savedMetric={savedMetric}
          canSaveMetric={canSaveMetric}
          setCanSaveMetric={setCanSaveMetric}
          setIsLoading={setIsLoading}
        />
      </ActionPanel>
      <ViewPanel>
        <TransientMetricView
          metric={metric}
          setDateRange={setDateRange}
          dateRange={dateRange}
          isLoading={isLoading}
        />
      </ViewPanel>
    </Flex>
  );
};

export default Metric;
