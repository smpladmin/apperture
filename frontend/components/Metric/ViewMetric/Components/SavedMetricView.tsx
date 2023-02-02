import { Flex } from '@chakra-ui/react';
import React from 'react';
import MetricEmptyState from '../../CreateMetric/Components/MetricEmptyState';
import Loader from '@components/LoadingSpinner';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from '../../CreateMetric/Components/MetricTrend';

type SavedMetricViewProps = {
  metric: ComputedMetric | null;
  isLoading: boolean;
};

const SavedMetricView = ({ metric, isLoading }: SavedMetricViewProps) => {
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
      ) : metric && metric.data.length > 0 ? (
        <MetricTrend
          data={metric.data}
          definition={metric.definition}
          average={metric.average}
        />
      ) : (
        <MetricEmptyState />
      )}
    </Flex>
  );
};

export default SavedMetricView;
