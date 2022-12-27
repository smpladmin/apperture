import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import { Metric } from '@lib/domain/metric';
import React, { useState } from 'react';
import CreateMetricAction from './CreateMetric/CreateMetricAction';
import TransientMetricView from './CreateMetric/TransientMetricView';

const Metric = () => {
  const [metric, setMetric] = useState<Metric | null>(null);
  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateMetricAction setMetric={setMetric} />
      </ActionPanel>
      <ViewPanel>
        <TransientMetricView metric={metric} />
      </ViewPanel>
    </Flex>
  );
};

export default Metric;
