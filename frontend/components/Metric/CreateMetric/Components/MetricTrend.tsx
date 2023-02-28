import { Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { ComputedMetricData } from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
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
                 (item: ComputedMetricData) =>
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
  color: graphColors,
};

const convertToTableData = (result: any[]) => {
  const res = result?.flatMap((res) => {
    const name = res.name;
    const data: any = [];
    res.series.forEach((series: any) => {
      let x: any = {};
      let propertyValue;
      series.breakdown.forEach((breakdown: any) => {
        propertyValue = breakdown['value'] || '(empty string)';
      });
      let sum = 0;
      let count = series.data?.length || 1;
      series.data.forEach((d: any) => {
        //@ts-ignore
        x[d.date] = d.value;
        sum += d.value;
      });

      data.push({
        name,
        propertyValue,
        values: x,
        average: sum / count,
      });
    });
    return data
      .filter((d: any) => d.average)
      .sort((a: any, b: any) => b.average - a.average);
  });
  return res;
};

const convertToTrendData = (result: any[]) => {
  return result?.flatMap((res: any) => {
    const name = res.name;
    return res.series.flatMap((series: any) => {
      let seriesName = name;
      if (series.breakdown.length)
        seriesName = `${seriesName}/${
          series.breakdown[0].value || '(empty string)'
        }`;
      return series.data.map((d: any) => {
        return { ...d, series: seriesName };
      });
    });
  });
};

const MetricTrend = ({ data, breakdown }: any) => {
  const [selectedBreakdowns, setSelectedBreakdowns] = useState<string[]>([]);

  useEffect(() => {
    if (!breakdown.length) return;

    let breakdownValues: string[] = [];
    convertToTableData(data)?.forEach((d) => {
      breakdownValues.push(`${d.name}/${d.propertyValue}`);
    });
    setSelectedBreakdowns(breakdownValues.slice(0, 5));
  }, [data, breakdown]);

  const trendData = useMemo(() => {
    if (!breakdown.length) return convertToTrendData(data);

    return convertToTrendData(data)?.filter((d) =>
      selectedBreakdowns.includes(d.series)
    );
  }, [data, selectedBreakdowns]);

  const metricTableData = useMemo(() => {
    return convertToTableData(data).slice(0, 200);
  }, [data, breakdown]);

  console.log('trend Data', trendData);
  console.log('metric table data', metricTableData);
  console.log('selected breakdowns', selectedBreakdowns);

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
      <LineChart {...config} data={trendData} />

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

// const tableData: any = {};
// data.forEach((item: ComputedMetricData) => {
//   tableData[item.series] =
//     tableData[item.series] === undefined
//       ? {
//           series: item.series,
//           average: average ? formatDatalabel(average[item.series]) : 0,
//           [formatDate(item.date)]: formatDatalabel(item.value),
//         }
//       : {
//           ...tableData[item.series],
//           [formatDate(item.date)]: formatDatalabel(item.value),
//         };
// });
// return Object.values(tableData);

// const convertToTableData = (result: any[]) => {
//   const x = result?.map((res) => {
//     const name = res.name;
//     let properties: any = [];
//     let values: any = [];
//     res.series.forEach((series: any) => {
//       if (series.breakdown.length) properties.push(series.breakdown[0]);
//       let x = {};
//       series.data.forEach((d: any) => {
//         //@ts-ignore
//         x[formatDate(d['date'])] = formatDatalabel(d['value']);
//       });
//       values.push(x);
//     });
//     return { name, properties, values };
//   });
//   return x;
// };

// [
//   {
//     series,
//     average,
//     2022-12,
//     2022
//   }
// ]
