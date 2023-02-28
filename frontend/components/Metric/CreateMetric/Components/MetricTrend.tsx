import { Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import {
  Breakdown,
  ComputedMetric,
  ComputedMetricData,
  MetricTableData,
  MetricTrendData,
} from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
import { setConfig } from 'next/config';
import React, { useEffect, useMemo, useState } from 'react';
import MetricTable from './MetricTable';

const formatDate = (date: string): string => {
  return convertISODateToReadableDate(date).split('-').reverse().join(' ');
};

export const COLOR_PALLETE_5 = [
  { colorName: 'messenger', hexaValue: '#0078FF' },
  { colorName: 'yellow', hexaValue: '#fac213' },
  { colorName: 'cyan', hexaValue: '#00B5D8' },
  { colorName: 'whatsapp', hexaValue: '#22c35e' },
  { colorName: 'red', hexaValue: '#E53E3E' },
];

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

const convertToTableData = (result: ComputedMetric[]): MetricTableData[] => {
  const res = result?.flatMap((res) => {
    const name = res.name;
    const data: MetricTableData[] = [];
    res.series.forEach((series) => {
      let dateValue: { [key in string]: string } = {};
      let propertyValue;

      // set property value if breakdown is set
      if (series.breakdown.length)
        propertyValue = series.breakdown[0].value || '(empty string)';

      let sum = 0;
      let count = series.data?.length || 1;
      series.data.forEach((d) => {
        dateValue[formatDate(d.date)] = formatDatalabel(d.value);
        sum += d.value;
      });

      data.push({
        name,
        propertyValue,
        values: dateValue,
        average: (sum / count).toFixed(2),
      });
    });
    return data
      .filter((d) => d.average)
      .sort((a, b) => +b.average - +a.average);
  });
  return res;
};

export const convertToTrendData = (
  result: ComputedMetric[]
): MetricTrendData[] => {
  return result?.flatMap((res) => {
    const name = res.name;
    return res.series.flatMap((series) => {
      let seriesName = name;
      if (series.breakdown.length)
        seriesName = `${seriesName}/${
          series.breakdown[0].value || '(empty string)'
        }`;
      return series.data.map((d) => {
        return { ...d, series: seriesName };
      });
    });
  });
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
    const rowIndexes = selectedBreakdowns.map(({ rowIndex }) => rowIndex % 5);

    const graphColors = COLOR_PALLETE_5.filter((_, index) =>
      rowIndexes.includes(index)
    ).map(({ hexaValue }) => hexaValue);

    setGraphConfig({
      ...graphConfig,
      color: ({ series }: { series: string }) => {
        const colorIndex =
          selectedBreakdowns.find(({ value }) => value === series)?.rowIndex ||
          0;

        return graphColors[colorIndex % 5];
      },
    });
  }, [selectedBreakdowns]);

  const trendData = useMemo(() => {
    if (!breakdown.length) return convertToTrendData(data);

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
