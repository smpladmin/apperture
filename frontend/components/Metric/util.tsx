import {
  ComputedMetric,
  MetricAggregate,
  MetricEventFilter,
  MetricTableData,
  MetricTrendData,
} from '@lib/domain/metric';
import {
  convertISODateToReadableDate,
  formatDatalabel,
} from '@lib/utils/common';

export const replaceEmptyStringPlaceholder = (
  aggregates: MetricAggregate[]
) => {
  return aggregates.map((aggregate: MetricAggregate) => {
    const processedFilter = aggregate?.filters.map(
      (filter: MetricEventFilter) => {
        const processedValues = filter.values.map((value: string) =>
          value === '(empty string)' ? '' : value
        );
        return { ...filter, values: processedValues };
      }
    );
    return {
      ...aggregate,
      filters: processedFilter,
    };
  });
};

export const replaceFilterValueWithEmptyStringPlaceholder = (
  aggregates: MetricAggregate[]
) => {
  return aggregates.map((aggregate: MetricAggregate) => {
    const processedFilter = aggregate?.filters.map(
      (filter: MetricEventFilter) => {
        const processedValues = filter.values.map((value: string) =>
          value === '' ? '(empty string)' : value
        );
        return { ...filter, values: processedValues };
      }
    );
    return {
      ...aggregate,
      filters: processedFilter,
    };
  });
};

export const getCountOfAggregates = (aggregates: MetricAggregate[]) => {
  const validAggregatesWithReferenceId = aggregates.filter(
    (aggregate) => aggregate.reference_id
  );
  return validAggregatesWithReferenceId.length;
};

export const isValidAggregates = (aggregates: MetricAggregate[]) => {
  return (
    aggregates.length &&
    aggregates.every(
      (aggregate) =>
        aggregate.reference_id &&
        aggregate.variable &&
        aggregate.filters.every(
          (filter: MetricEventFilter) => filter.values.length
        )
    )
  );
};

export const formatDate = (date: string): string => {
  return convertISODateToReadableDate(date).split('-').reverse().join(' ');
};

export const COLOR_PALLETE_5 = [
  { colorName: 'messenger', hexaValue: '#0078FF' },
  { colorName: 'yellow', hexaValue: '#fac213' },
  { colorName: 'cyan', hexaValue: '#00B5D8' },
  { colorName: 'whatsapp', hexaValue: '#22c35e' },
  { colorName: 'red', hexaValue: '#E53E3E' },
];

export const convertToTableData = (
  result: ComputedMetric[]
): MetricTableData[] => {
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
      .filter((d) => +d.average)
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
