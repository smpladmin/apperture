import { EventOrSegmentComponent, MetricEventFilter } from '@lib/domain/metric';

export const replaceEmptyStringToPlaceholder = (
  aggregates: EventOrSegmentComponent[]
) => {
  return aggregates.map((aggregate: EventOrSegmentComponent) => {
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

export const replacePlaceholderToEmptyString = (
  aggregates: EventOrSegmentComponent[]
) => {
  return aggregates.map((aggregate: EventOrSegmentComponent) => {
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
