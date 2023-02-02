import { Line } from '@antv/g2plot';
import { Box, Flex, Tag, TagLabel, usePrevious } from '@chakra-ui/react';
import LineChart, { LineChartProps } from '@components/Charts/Line';
import { ComputedMetric, ComputedMetricData } from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
import { BLUE } from '@theme/index';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useRef } from 'react';
import MetricTable from './MetricTable';

const formatDate = (date: string): string => {
  return convertISODateToReadableDate(date).split('-').reverse().join(' ');
};

const config = {
  padding: 'auto',
  autoFit: true,
  xField: 'date',
  yField: 'value',
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
  tooltip: {
    formatter: ({ date, value }: { date: string; value: string }) => {
      return {
        title: convertISODateToReadableDate(date),
        name: 'value',
        value: value,
      };
    },
    customContent: (_: any, data: any) => {
      const data_list = data.map((i: any) => i.data);
      return `<div id='metric-tooltip'>
             ${data_list
               .map(
                 (item: any) =>
                   `<span class='metric-tooltip series'>${item.series}</span>
                 <span class='metric-tooltip value'>${formatDatalabel(
                   item.value
                 )} Events</span>
                   `
               )
               .join('')}
               <span class='metric-tooltip date'>${
                 data_list.length &&
                 String(new Date(data_list[0].date))
                   .split(' ')
                   .slice(0, 5)
                   .join(' ')
               }
                   </span>
         </div>`;
    },
  },
  animation: true,
};

const convertToTableData = (data: ComputedMetricData[], average: any) => {
  const tableData: any = {};
  data.forEach((item: ComputedMetricData) => {
    tableData[item.series] =
      tableData[item.series] === undefined
        ? {
            series: item.series,
            average: average ? formatDatalabel(average[item.series]) : 0,
            [formatDate(item.date)]: formatDatalabel(item.value),
          }
        : {
            ...tableData[item.series],
            [formatDate(item.date)]: formatDatalabel(item.value),
          };
  });
  return Object.values(tableData);
};

const MetricTrend = ({ data, definition, average }: ComputedMetric) => {
  // convertToTableData(data);
  return (
    <Flex
      height={'full'}
      width={'full'}
      justifyContent={'center'}
      direction={'column'}
      className="metric-chart"
    >
      <LineChart {...config} data={data} />
      <MetricTable data={convertToTableData(data, average)} />
    </Flex>
  );
};

export default MetricTrend;
