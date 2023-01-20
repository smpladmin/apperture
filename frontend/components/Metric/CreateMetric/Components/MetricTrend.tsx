import { Line } from '@antv/g2plot';
import { Box, Flex, Tag, TagLabel, usePrevious } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { ComputedMetric } from '@lib/domain/metric';
import { convertISODateToReadableDate } from '@lib/utils/common';
import { BLUE } from '@theme/index';
import React, { useRef } from 'react';

const config = {
  padding: 'auto',
  autoFit: true,
  xField: 'date',
  yField: 'value',
  xAxis: {
    label: {
      formatter: (text: string) => {
        return convertISODateToReadableDate(text);
      },
    },
  },
  legend: { position: 'top' },
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
  lineStyle: {
    stroke: BLUE,
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
      alignItems="center"
      alignContent="center"
      justifyContent={'center'}
      direction={'column'}
    >
      <Flex py={10}>
        <Tag cursor={'pointer'}>
          <Box
            height={2}
            width={2}
            background={BLUE}
            borderRadius={'full'}
            marginRight={2}
          ></Box>
          <TagLabel fontSize={'xs-12'} lineHeight={'xs-16'}>
            {definition}
          </TagLabel>
        </Tag>
      </Flex>
      <LineChart {...config} data={data} />
      <Box width={'full'} ref={ref} h={'88'} data-testid={'funnel-trend'}></Box>
    </Flex>
  );
};

export default MetricTrend;
