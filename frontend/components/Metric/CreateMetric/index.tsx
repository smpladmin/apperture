import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateRangeType, Metric } from '@lib/domain/metric';
import React, { useState } from 'react';
import CreateMetricAction from './Components/CreateMetricAction';
import TransientMetricView from './Components/TransientMetricView';

const Metric = () => {
  const [metric, setMetric] = useState<Metric | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeType | null>(null);
  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateMetricAction setMetric={setMetric} dateRange={dateRange} />
      </ActionPanel>
      <ViewPanel>
        <TransientMetricView
          metric={metric}
          setDateRange={setDateRange}
          dateRange={dateRange}
        />
      </ViewPanel>
    </Flex>
  );
};

export default Metric;
