import { Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { formatDatalabel } from '@lib/utils/common';
import React, { useEffect, useState } from 'react';
import { COLOR_PALLETE_5, formatDate } from '@components/Metric/util';
import { RetentionTrendsData, TrendScale } from '@lib/domain/retention';

const graphColors = COLOR_PALLETE_5.map((color) => color.hexaValue);

const config = {
  padding: 'auto',
  autoFit: true,
  xField: 'granularity',
  yField: 'retentionRate',
  seriesField: 'series',
  xAxis: {
    label: {
      formatter: (text: string) => {
        return formatDate(text);
      },
    },
  },
  yAxis: {
    label: {
      formatter: (value: number) => {
        return formatDatalabel(value);
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
  animation: true,
  color: ({ series }: { series: string }) => graphColors[0],
};

type RetentionTrendProps = {
  data: RetentionTrendsData[];
  trendScale: TrendScale;
};

const RetentionTrend = ({ data, trendScale }: RetentionTrendProps) => {
  const [graphConfig, setGraphConfig] = useState(config);

  useEffect(() => {
    const trendYField =
      trendScale == TrendScale.ABSOLUTE ? 'retainedUsers' : 'retentionRate';
    setGraphConfig({ ...graphConfig, yField: trendYField });
  }, [trendScale]);

  return (
    <Flex direction={'column'} p={'4'} pt={'6'}>
      <LineChart {...graphConfig} data={data} />
    </Flex>
  );
};

export default RetentionTrend;
