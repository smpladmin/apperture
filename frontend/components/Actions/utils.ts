import { ActionGroup, CaptureEvent, ConditionType } from '@lib/domain/action';

export const isValidAction = (groups: ActionGroup[]) =>
  groups.every((group) => {
    return [
      ConditionType.href,
      ConditionType.selector,
      ConditionType.text,
      ConditionType.url,
    ].some((groupKey: Exclude<keyof ActionGroup, ['event', 'url_matching']>) =>
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
    isDisabled: false,
  },
];
