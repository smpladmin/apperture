import { Flex } from '@chakra-ui/react';
import React from 'react';
import MetricEmptyState from './MetricEmptyState';
import DateFilterComponent from '@components/Date/DateFilter';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';
import Loader from '@components/LoadingSpinner';
import { DateFilterObj } from '@lib/domain/common';
import Card from '@components/Card';

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
        <Card>
          <Flex
            alignItems={'center'}
            justifyContent={'center'}
            height={'120'}
            mt={'5'}
          >
            <Loader />
          </Flex>
        </Card>
      ) : (
        <MetricTrend data={metric} breakdown={breakdown} />
      )}
    </Flex>
  );
};

export default TransientMetricView;
