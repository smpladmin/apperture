import { FunnelStep } from '@lib/domain/funnel';
import { RetentionEvents } from '@lib/domain/retention';

export const hasValidEvents = (retentionEvents: RetentionEvents) => {
  return retentionEvents.startEvent.event && retentionEvents.goalEvent.event;
};

export const replaceFilterValueWithEmptyStringPlaceholder = (
  retentionEvent: FunnelStep
) => {
  return retentionEvent.filters.map((filter) => {
    const emptyStringIndex = filter.values.indexOf('');
    if (emptyStringIndex !== -1)
      filter.values[emptyStringIndex] = '(empty string)';
    return filter;
  });
};
