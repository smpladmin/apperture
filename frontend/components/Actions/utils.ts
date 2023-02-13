import { ActionGroup, CaptureEvent } from '@lib/domain/action';

export const isValidAction = (groups: ActionGroup[]) =>
  groups.every((group) => {
    return (Object.keys(group) as (keyof ActionGroup)[]).some((groupKey) =>
      Boolean(group[groupKey])
    );
  });

export const filterEmptyActionSelectors = (groups: ActionGroup[]) => {
  return groups.map((group) => {
    (Object.keys(group) as (keyof ActionGroup)[]).forEach((key) => {
      if (!group[key]) delete group[key];
    });
    return group;
  });
};

export const CaptureEventOptions = [
  {
    label: 'Autocapture',
    value: CaptureEvent.AUTOCAPTURE,
    isDisabled: false,
  },
  {
    label: 'Pageview',
    value: CaptureEvent.PAGEVIEW,
    isDisabled: true,
  },
];
