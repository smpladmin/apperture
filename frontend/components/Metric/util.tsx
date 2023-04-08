import { WhereFilter } from '@lib/domain/common';
import {
  ComputedMetric,
  MetricAggregate,
  MetricBasicAggregation,
  MetricSegmentFilter,
  MetricTableData,
  MetricTrendData,
} from '@lib/domain/metric';
import { convertISODateToReadableDate } from '@lib/utils/common';
import {
  BLUE_500,
  GREEN_500,
  PURPLE_500,
  RED_500,
  YELLOW_500,
} from '@theme/index';
import { WhereSegmentFilter } from '@lib/domain/segment';

export const replaceEmptyStringPlaceholder = (
  aggregates: MetricAggregate[]
) => {
  return aggregates.map((aggregate: MetricAggregate) => {
    const processedFilter = aggregate?.filters.map((filter: WhereFilter) => {
      const processedValues = filter.values.map((value: string) =>
        value === '(empty string)' ? '' : value
      );
      return { ...filter, values: processedValues };
    });
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
    const processedFilter = aggregate?.filters.map((filter: WhereFilter) => {
      const processedValues = filter.values.map((value: string) =>
        value === '' ? '(empty string)' : value
      );
      return { ...filter, values: processedValues };
    });
    return {
      ...aggregate,
      filters: processedFilter,
    };
  });
};

export const getCountOfValidAggregates = (aggregates: MetricAggregate[]) => {
  const validAggregatesWithReferenceId = aggregates.filter(
    (aggregate) => aggregate.reference_id
  );
  return validAggregatesWithReferenceId.length;
};

const _isEveryCustomSegmentFilterValid = (filters: WhereSegmentFilter[]) => {
  return filters?.every((filter) => filter.values.length);
};

export const isValidMetricSegmentFilter = (
  segmentFilters: MetricSegmentFilter[]
) => {
  return segmentFilters.every(
    (filter) =>
      (filter.custom.filters.length || filter.segments.length) &&
      _isEveryCustomSegmentFilterValid(
        filter.custom.filters as WhereSegmentFilter[]
      )
  );
};

const _isValidAggregation = (aggregation: any) => {
  if (
    [MetricBasicAggregation.TOTAL, MetricBasicAggregation.UNIQUE].includes(
      aggregation.functions
    )
  )
    return true;

  return Boolean(aggregation.property);
};

export const isValidAggregates = (
  aggregates: MetricAggregate[],
  segmentFilters: MetricSegmentFilter[]
) => {
  return (
    aggregates.length &&
    aggregates.every(
      (aggregate) =>
        aggregate.reference_id &&
        aggregate.variable &&
        aggregate.filters.every(
          (filter: WhereFilter) => filter.values.length
        ) &&
        _isValidAggregation(aggregate.aggregations)
    ) &&
    _isEveryCustomSegmentFilterValid(
      segmentFilters[0].custom.filters as WhereSegmentFilter[]
    )
  );
};

export const formatDate = (date: string): string => {
  return convertISODateToReadableDate(date).split('-').reverse().join(' ');
};

export const COLOR_PALLETE_5 = [
  { colorName: 'blue', hexaValue: BLUE_500 },
  { colorName: 'red', hexaValue: RED_500 },
  { colorName: 'purple', hexaValue: PURPLE_500 },
  { colorName: 'yellow', hexaValue: YELLOW_500 },
  { colorName: 'green', hexaValue: GREEN_500 },
];

export const useColorFromPallete = (
  metricDefinition: string,
  breakdown: string[]
) => {
  /* 
    use color from pallete for aggregate variable if any of the following true conditons satisfies :
    a. has metric definition  
        1. has one Aggregate // false
        2. has multiple aggregates // false
        3. has breakdown with one aggregate // false


    b. has no metric definition
        1. has only one aggregate  // true
        2. has multiple aggregates // true
        3. has breakdown with one aggregate // false
    
  */

  if (breakdown.length) return false;

  if (metricDefinition) return false;

  return true;
};

export const enableBreakdown = (
  aggregates: MetricAggregate[],
  metricDefinition: string
) => {
  /* 
    disable breakdown for following cases:
      - if metric definition is not present with multiple aggregates
      - if no valid aggregate is present
  */

  if (getCountOfValidAggregates(aggregates) === 0) return false;

  if (!metricDefinition && getCountOfValidAggregates(aggregates) > 1)
    return false;

  return true;
};

export const convertToTableData = (
  result: ComputedMetric[]
): MetricTableData[] => {
  const res = result?.flatMap((res) => {
    const name = res.name;
    const data: MetricTableData[] = [];
    res.series.forEach((series) => {
      let dateValue: { [key in string]: number } = {};
      let propertyValue;

      // set property value if breakdown is set
      if (series.breakdown.length)
        propertyValue = series.breakdown[0].value || '(empty string)';

      let sum = 0;
      let count = series.data?.length || 1;
      series.data.forEach((d) => {
        dateValue[formatDate(d.date)] = d.value;
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

export const getCountOfSeries = (metricData: ComputedMetric[]) => {
  const uniqueSeries = metricData?.flatMap((res) => {
    const name = res.name;
    return res.series.flatMap((series) => {
      let seriesName = name;
      series.breakdown.forEach((breakdown) => {
        seriesName += `/${breakdown.value || '(empty string)'}`;
      });
      return seriesName;
    });
  });
  return uniqueSeries.length;
};

export const metricAggregationDisplayText: { [key: string]: string } = {
  count: 'Total Count',
  unique: 'Unique Count',
  ap_sum: 'Sum',
  ap_median: 'Median',
  ap_average: 'Average',
  ap_distinct_count: 'Distinct Count',
  ap_min: 'Minimum',
  ap_max: 'Maximum',
  ap_p25: '25th Percentile',
  ap_p75: '75th Percentile',
  ap_p90: '90th Percentile',
  ap_p99: '99th Percentile',
};

export const getDisplayAggregationFunctionText = (value: string) => {
  return metricAggregationDisplayText[value];
};
