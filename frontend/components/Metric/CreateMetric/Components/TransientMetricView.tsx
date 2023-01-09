import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Highlight,
  Text,
} from '@chakra-ui/react';
import { FunnelData, FunnelTrendsData } from '@lib/domain/funnel';
import React, { useContext, useEffect, useState } from 'react';
import Loader from '@components/LoadingSpinner';
import MetricEmptyState from './MetricEmptyState';
import DateFilter from './DateFilter';
import { DateRangeType, Metric } from '@lib/domain/metric';
import MetricTrend from './MetricTrend';

type TransientMetricViewProps = {
  metric: Metric | null;
  setDateRange: Function;
  dateRange: DateRangeType | null;
};

const TransientMetricView = ({
  metric,
  setDateRange,
  dateRange,
}: TransientMetricViewProps) => {
  return (
    <Flex
      direction={'column'}
      py={{ base: '8', md: '12' }}
      width={'full'}
      height={'full'}
    >
      <Flex justifyContent={'space-between'}>
        <Flex>
          <DateFilter setDateRange={setDateRange} dateRange={dateRange} />
        </Flex>

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
    </Flex>
  );
};

export default TransientMetricView;
