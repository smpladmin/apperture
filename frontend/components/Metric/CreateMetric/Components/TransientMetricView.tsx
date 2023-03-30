import { Flex } from '@chakra-ui/react';
import React from 'react';
import MetricEmptyState from './MetricEmptyState';
import DateFilterComponent from '@components/Date/DateFilter';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';
import Loader from '@components/LoadingSpinner';

import { DateFilterObj } from '@lib/domain/common';

type TransientMetricViewProps = {
  metric: ComputedMetric[];
  isLoading: boolean;
  breakdown: string[];
  showEmptyState: boolean;
  dateFilter: DateFilterObj;
  setDateFilter: Function;
};

const TransientMetricView = ({
  metric,
  isLoading,
  breakdown,
  showEmptyState,
  dateFilter,
  setDateFilter,
}: TransientMetricViewProps) => {
  return (
    <Flex
      direction={'column'}
      py={{ base: '8', md: '12' }}
      width={'full'}
      minHeight={'full'}
      overflowY={'scroll'}
    >
      <Flex w="full" justifyContent={'space-between'}>
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      </Flex>
      {showEmptyState ? (
        <MetricEmptyState />
      ) : isLoading ? (
        <Flex alignItems={'center'} justifyContent={'center'} height={'120'}>
          <Loader />
        </Flex>
      ) : (
        <MetricTrend data={metric} breakdown={breakdown} />
      )}
    </Flex>
  );
};

export default TransientMetricView;
