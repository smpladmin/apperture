import { Button, Flex } from '@chakra-ui/react';
import React from 'react';
import MetricEmptyState from './MetricEmptyState';
import DateFilter from './DateFilter';
import { DateRangeType, ComputedMetric, Metric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';
import Loader from '@components/LoadingSpinner';

type TransientMetricViewProps = {
  metric: ComputedMetric | null;
  setDateRange: Function;
  dateRange: DateRangeType | null;
  isLoading: boolean;
};

const TransientMetricView = ({
  metric,
  setDateRange,
  dateRange,
  isLoading,
}: TransientMetricViewProps) => {
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
      ) : (
        <>
          <Flex w="full" justifyContent={'space-between'}>
            <DateFilter setDateRange={setDateRange} dateRange={dateRange} />

            <Flex direction={'column'} gap={'1'}>
              <Button
                _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
                border="1px solid #EDEDED"
                id="yesterday"
                color={'grey.200'}
                fontWeight={400}
                variant={'outline'}
                height={8}
                fontSize={'xs-12'}
              >
                <i
                  style={{
                    marginRight: '10px',
                    transform: 'rotate(90deg)',
                    fontSize: '12px',
                  }}
                  className="ri-sound-module-line"
                ></i>{' '}
                Filters
              </Button>
            </Flex>
          </Flex>
          {metric && metric.data.length > 0 ? (
            <MetricTrend data={metric.data} definition={metric.definition} />
          ) : (
            <MetricEmptyState />
          )}
        </>
      )}
    </Flex>
  );
};

export default TransientMetricView;
