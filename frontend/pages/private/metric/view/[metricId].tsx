import { Box, Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { metricChartConfig } from '@components/Metric/components/MetricTrend';
import { convertToTrendData } from '@components/Metric/util';
import { ComputedMetric, Metric } from '@lib/domain/metric';
import {
  _getSavedMetricPrivate,
  _getTransientTrendsDataPrivate,
} from '@lib/services/metricService';
import { GetServerSideProps } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { metricId } = query;
  const apiKey = process.env.APPERTURE_API_KEY;

  const savedMetric: Metric = await _getSavedMetricPrivate(
    apiKey!!,
    metricId as string
  );

  if (!savedMetric) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  const {
    datasourceId,
    aggregates,
    function: metricDefinition,
    breakdown,
    dateFilter,
  } = savedMetric;

  const formattedMetricDefinition = metricDefinition?.length
    ? metricDefinition.replace(/\s*/g, '')
    : aggregates.map((aggregate) => aggregate.variable).join(',');

  const trendsData = await _getTransientTrendsDataPrivate(
    apiKey!!,
    datasourceId,
    formattedMetricDefinition,
    aggregates,
    breakdown,
    dateFilter || null
  );

  return {
    props: { trendsData, breakdown },
  };
};

const Metric = ({ trendsData }: { trendsData: ComputedMetric[] }) => {
  return (
    <Flex justifyContent={'center'} alignItems={'center'}>
      <Box w={'200'} h={'80'}>
        <LineChart
          {...metricChartConfig}
          data={convertToTrendData(trendsData)}
        />
      </Box>
    </Flex>
  );
};

export default Metric;
