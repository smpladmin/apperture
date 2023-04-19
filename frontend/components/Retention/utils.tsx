import { RetentionEvents } from '@lib/domain/retention';

export const hasValidEvents = (retentionEvents: RetentionEvents) => {
  return retentionEvents.startEvent.event && retentionEvents.goalEvent.event;
};
