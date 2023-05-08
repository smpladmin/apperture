import { ExternalSegmentFilter, WhereFilter } from '@lib/domain/common';
import { FunnelStep } from '@lib/domain/funnel';
import { RetentionEvents } from '@lib/domain/retention';
import { WhereSegmentFilter } from '@lib/domain/segment';
import { isEveryCustomSegmentFilterValid } from '@lib/utils/common';

const _hasValidFilterValues = (filters: WhereFilter[]) => {
  return filters.every((filter) => filter.values.length);
};

export const hasValidEvents = (retentionEvents: RetentionEvents) => {
  return retentionEvents.startEvent.event && retentionEvents.goalEvent.event;
};

export const hasValidFilterValuesForAllEvents = (
  retentionEvents: RetentionEvents
) => {
  return (
    _hasValidFilterValues(retentionEvents.startEvent.filters) &&
    _hasValidFilterValues(retentionEvents.goalEvent.filters)
  );
};

export const substituteEmptyStringWithPlaceholder = (
  retentionEvent: FunnelStep,
  reverse = false
) => {
  const toFind = reverse ? '(empty string)' : '';
  const toReplace = reverse ? '' : '(empty string)';
  const updatedFilters = retentionEvent.filters.map((filter) => {
    const emptyStringIndex = filter.values.indexOf(toFind);
    if (emptyStringIndex !== -1) filter.values[emptyStringIndex] = toReplace;
    return filter;
  });
  return { ...retentionEvent, filters: updatedFilters };
};

export const hasValidRetentionEventAndFilters = (
  retentionEvents: RetentionEvents,
  segmentFilters: ExternalSegmentFilter[]
) => {
  return (
    hasValidEvents(retentionEvents) &&
    hasValidFilterValuesForAllEvents(retentionEvents) &&
    isEveryCustomSegmentFilterValid(
      segmentFilters[0].custom.filters as WhereSegmentFilter[]
    )
  );
};
