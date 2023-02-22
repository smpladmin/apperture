import { MetricAggregate, MetricEventFilter } from '@lib/domain/metric';

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
