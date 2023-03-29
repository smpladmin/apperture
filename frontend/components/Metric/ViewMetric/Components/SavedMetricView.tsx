import { Button, Flex, Highlight, Text } from '@chakra-ui/react';
import React from 'react';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from '../../CreateMetric/components/MetricTrend';
import DateFilterComponent from '@components/Date/DateFilter';
import Loader from '@components/LoadingSpinner';
import { DateFilterObj } from '@lib/domain/common';
import MetricEmptyState from '@components/Metric/CreateMetric/components/MetricEmptyState';

type SavedMetricViewProps = {
  isLoading: boolean;
  metric: ComputedMetric[];
  breakdown: string[];
  dateFilter: DateFilterObj;
};

const SavedMetricView = ({
  isLoading,
  metric,
  breakdown,
  dateFilter,
}: SavedMetricViewProps) => {
  return (
    <Flex
      direction={'column'}
      width={'full'}
      minHeight={'full'}
      overflowY={'scroll'}
      gap={'5'}
    >
      <DateFilterComponent
        dateFilter={dateFilter}
        setDateFilter={() => {}}
        isDisabled={true}
      />
      {isLoading ? (
        <Flex alignItems={'center'} justifyContent={'center'} h={'120'}>
          <Loader />
        </Flex>
      ) : (
        <MetricTrend data={metric} breakdown={breakdown} />
      )}
    </Flex>
  );
};

export default SavedMetricView;
