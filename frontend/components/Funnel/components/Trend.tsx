import { Line } from '@antv/g2plot';
import { Box, usePrevious } from '@chakra-ui/react';
import { FunnelTrendsData } from '@lib/domain/funnel';
import { convertISODateToReadableDate } from '@lib/utils/common';
import { BLUE } from '@theme/index';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useRef } from 'react';

const Trend = ({ data }: { data: FunnelTrendsData[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const plot = useRef<{ line: Line | null }>({ line: null });
  const previousData = usePrevious(data);

  useEffect(() => {
    if (isEqual(previousData, data)) return;

    plot.current.line = new Line(ref.current!!, {
      data,
      padding: 'auto',
      xField: 'startDate',
      yField: 'conversion',
      yAxis: {
        label: {
          formatter: (text) => {
            return `${text}%`;
          },
        },
      },
      xAxis: {
        label: {
          formatter: (text) => {
            return convertISODateToReadableDate(text);
          },
        },
      },
      tooltip: {
        showMarkers: true,
        showCrosshairs: true,
        shared: true,
        formatter: ({ startDate, conversion }) => {
          return {
            title: convertISODateToReadableDate(startDate),
            name: 'Conversion',
            value: `${conversion}%`,
          };
        },
      },
      lineStyle: {
        stroke: BLUE,
      },
      animation: false,
    });
    plot.current.line?.render();
  }, [data]);
  return <Box ref={ref} h={'88'}></Box>;
};

export default Trend;
