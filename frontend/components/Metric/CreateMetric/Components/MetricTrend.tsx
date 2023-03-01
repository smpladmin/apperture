import { Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import {
  COLOR_PALLETE_5,
  convertToTableData,
  convertToTrendData,
  formatDate,
} from '../../util';
import {
  Breakdown,
  ComputedMetric,
  ComputedMetricData,
  MetricTrendData,
} from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
import React, { useEffect, useMemo, useState } from 'react';
import MetricTable from './MetricTable';

const graphColors = COLOR_PALLETE_5.map((color) => color.hexaValue);

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
      const data_list = data.map((i: any): ComputedMetricData => i.data);
      return `<div id='metric-tooltip'>
             ${data_list
               .map(
                 (item: MetricTrendData) =>
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
  color: ({ series }: { series: string }) => graphColors[0],
};

type MetricTrendProps = {
  data: ComputedMetric[];
  breakdown: string[];
};

const MetricTrend = ({ data, breakdown }: MetricTrendProps) => {
  const [selectedBreakdowns, setSelectedBreakdowns] = useState<Breakdown[]>([]);
  const [graphConfig, setGraphConfig] = useState(config);

  useEffect(() => {
    if (!breakdown.length) return;

    let breakdownValues: any[] = [];
    convertToTableData(data)?.forEach((d, i) => {
      breakdownValues.push({
        value: `${d.name}/${d.propertyValue}`,
        rowIndex: i,
      });
    });
    setSelectedBreakdowns(breakdownValues.slice(0, 5));
  }, [data, breakdown]);

  useEffect(() => {
    let uniqueSeries: string[] = [];

    setGraphConfig({
      ...graphConfig,
      color: ({ series }: { series: string }) => {
        if (!uniqueSeries.includes(series)) {
          uniqueSeries.push(series);
        }

        const colorIndex =
          selectedBreakdowns.find(({ value }) => value === series)?.rowIndex ||
          uniqueSeries.indexOf(series);

        return graphColors[colorIndex % 5];
      },
    });
  }, [selectedBreakdowns]);

  const trendData = useMemo(() => {
    if (!breakdown.length) return convertToTrendData(data);

    // sort on basis of row index to get consistent coloring across legends on metric chart
    return selectedBreakdowns
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .flatMap((breakdown) => {
        return convertToTrendData(data)?.filter(
          (d) => d.series === breakdown.value
        );
      });
  }, [data, selectedBreakdowns]);

  const metricTableData = useMemo(() => {
    return convertToTableData(data).slice(0, 100);
  }, [data, breakdown]);

  return (
    <Flex
      height={'full'}
      width={'full'}
      justifyContent={'center'}
      direction={'column'}
      className="metric-chart"
      gap={'10'}
      mt={'10'}
    >
      <LineChart {...graphConfig} data={trendData} />

      {!!metricTableData?.length && (
        <MetricTable
          data={metricTableData}
          breakdown={breakdown}
          selectedBreakdowns={selectedBreakdowns}
          setSelectedBreakdowns={setSelectedBreakdowns}
        />
      )}
    </Flex>
  );
};

export default MetricTrend;
