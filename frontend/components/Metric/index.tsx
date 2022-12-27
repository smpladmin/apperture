import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import React from 'react';
import CreateMetricAction from './CreateMetric/CreateMetricAction';
import TransientMetricView from './CreateMetric/TransientMetricView';

const Metric = () => {
  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateMetricAction />
      </ActionPanel>
      <ViewPanel>
        <TransientMetricView />
      </ViewPanel>
    </Flex>
  );
};

export default Metric;
