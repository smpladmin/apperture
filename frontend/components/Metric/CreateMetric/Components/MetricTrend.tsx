import { Flex } from '@chakra-ui/react';
import LineChart from '@components/Charts/Line';
import { ComputedMetric, ComputedMetricData } from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';
import React from 'react';
import MetricTable from './MetricTable';

const formatDate = (date: string): string => {
  return convertISODateToReadableDate(date).split('-').reverse().join(' ');
};

const COLOR_PLATE_5 = ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A'];

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
  color: COLOR_PLATE_5,
};

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

const convertToTableData = (result: any[]) => {
  const res = result?.flatMap((res) => {
    const name = res.name;
    const data: any = [];
    res.series.forEach((ser: any) => {
      let x: any = {};
      let propertyValue;
      ser.breakdown.forEach((breakdown: any) => {
        propertyValue = breakdown['value'];
      });
      let sum = 0;
      let count = ser.data?.length || 1;
      ser.data.forEach((d: any) => {
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
    return data;
  });
  return res;
};

const convertToTrendData = (result: any[]) => {
  return result?.flatMap((res: any) => {
    const name = res.name;
    return res.series.flatMap((series: any) => {
      let seriesName = name;
      if (series.breakdown.length)
        seriesName = `${seriesName}/${series.breakdown[0].value}`;
      return series.data.map((d: any) => {
        return { ...d, series: seriesName };
      });
    });
  });
};

const MetricTrend = ({ data }: any) => {
  console.log('table data', convertToTableData(data));
  return (
    <Flex
      height={'full'}
      width={'full'}
      justifyContent={'center'}
      direction={'column'}
      className="metric-chart"
    >
      <LineChart {...config} data={convertToTrendData(data)} />

      {!!data?.length && <MetricTable data={convertToTableData(data)} />}
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
