import { Flex } from '@chakra-ui/react';
import React from 'react';
import MetricEmptyState from '../../CreateMetric/Components/MetricEmptyState';
import Loader from '@components/LoadingSpinner';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from '../../CreateMetric/Components/MetricTrend';

type SavedMetricViewProps = {
  metric: ComputedMetric[];
  isLoading: boolean;
  breakdown: string[];
};

const SavedMetricView = ({
  metric,
  isLoading,
  breakdown,
}: SavedMetricViewProps) => {
  return (
    <Flex
      direction={'column'}
      pt={{ base: '8', md: '12' }}
      pb={{ base: '4', md: '4' }}
      width={'full'}
      height={'full'}
      justifyContent={'center'}
      alignItems={'center'}
      overflowY={'scroll'}
    >
      {isLoading ? (
        <Loader />
      ) : metric && metric.length > 0 ? (
        <MetricTrend data={metric} breakdown={breakdown} />
      ) : (
        <MetricEmptyState />
      )}
    </Flex>
  );
};

export default SavedMetricView;
