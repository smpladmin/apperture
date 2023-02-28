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
      py={{ base: '8', md: '12' }}
      width={'full'}
      height={'full'}
      justifyContent={'center'}
      alignItems={'center'}
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
