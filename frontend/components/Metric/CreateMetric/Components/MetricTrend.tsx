import { Line } from '@antv/g2plot';
import { Flex, usePrevious } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { ComputedMetric } from '@lib/domain/metric';
import { convertISODateToReadableDate } from '@lib/utils/common';
import React, { useRef } from 'react';

const config = {
  padding: 'auto',
  autoFit: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  xAxis: {
    label: {
      formatter: (text: string) => {
        return convertISODateToReadableDate(text);
      },
    },
  },
  legend: {
    position: 'top',
    autofit: false,
    marker: (name: string, index: number, option: any) => {
      return option?.style?.stroke
        ? {
            symbol: 'circle',
            style: {
              r: 4,
              fill: option?.style?.stroke,
            },
          }
        : undefined;
    },
  },
  tooltip: {
    showMarkers: true,
    shared: true,
    formatter: ({ date, value }: { date: string; value: string }) => {
      return {
        title: convertISODateToReadableDate(date),
        name: 'value',
        value: value,
      };
    },
  },
  animation: true,
};
const MetricTrend = ({ data, definition }: ComputedMetric) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ line: Line | null }>({ line: null });
  const previousData = usePrevious(data);

  return (
    <Flex
      height={'full'}
      width={'full'}
      justifyContent={'center'}
      direction={'column'}
    >
      <LineChart {...config} data={data} />
    </Flex>
  );
};

export default MetricTrend;
