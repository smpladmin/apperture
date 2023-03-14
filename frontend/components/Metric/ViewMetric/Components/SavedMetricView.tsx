import { Box, Button, Flex, Highlight, Text } from '@chakra-ui/react';
import React from 'react';
import { ComputedMetric } from '@lib/domain/metric';
import MetricTrend from '../../CreateMetric/Components/MetricTrend';
import DateFilterComponent from '@components/Date/DateFilter';
import Loader from '@components/LoadingSpinner';
import { DateFilter, DateFilterType } from '@lib/domain/common';
import MetricEmptyState from '@components/Metric/CreateMetric/Components/MetricEmptyState';

type SavedMetricViewProps = {
  isLoading: boolean;
  metric: ComputedMetric[];
  breakdown: string[];
  dateFilter: DateFilter | null;
  dateFilterType: DateFilterType | null;
};

const SavedMetricView = ({
  isLoading,
  metric,
  breakdown,
  dateFilter,
  dateFilterType,
}: SavedMetricViewProps) => {
  return (
    <Flex
      direction={'column'}
      py={{ base: '8', md: '12' }}
      width={'full'}
      height={'full'}
      overflowY={'scroll'}
    >
      <Flex w="full" justifyContent={'space-between'}>
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={() => {}}
          dateFilterType={dateFilterType}
          setDateFilterType={() => {}}
          isDisabled={true}
        />

        <Flex gap={'1'}>
          <Button
            _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
            border="1px solid #EDEDED"
            id="yesterday"
            color={'grey.200'}
            fontWeight={400}
            variant={'outline'}
            height={8}
            fontSize={'xs-12'}
            disabled={true}
          >
            <i
              style={{
                marginRight: '10px',
                transform: 'rotate(90deg)',
              }}
              className="ri-sound-module-line"
            ></i>
            Filters
          </Button>
          <Button
            _focus={{ bg: 'grey.50', color: 'black', fontWeight: 500 }}
            border="1px solid #EDEDED"
            id="yesterday"
            variant={'secondary'}
            height={8}
            data-testid={'select-breakdown'}
            disabled={true}
          >
            <Flex gap={'2'} color={'grey.200'} alignItems={'center'}>
              <i style={{ fontSize: '12px' }} className="ri-pie-chart-line" />
              <Text
                fontSize={'xs-12'}
                fontWeight={400}
                color={'grey.200'}
                data-testid={'breakdown-name'}
              >
                <Highlight
                  query={`${breakdown}`}
                  styles={{
                    fontSize: 'xs-12',
                    fontWeight: 500,
                    color: 'black.100',
                  }}
                >
                  {`Breakdown ${breakdown.join('')}`}
                </Highlight>
              </Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>
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
