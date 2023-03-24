import { FunnelStep, FunnelData } from '@lib/domain/funnel';

export const getCountOfValidAddedSteps = (steps: FunnelStep[]) => {
  return filterFunnelSteps(steps).length;
};

export const transformFunnelData = (funnelData: FunnelData[]) => {
  return funnelData?.map((data, i) => {
    const transformedData = { ...data };
    transformedData['event'] =
      `${Array(i + 1).join(' ')}` + transformedData['event'];
    transformedData['drop'] =
      i >= 1 ? funnelData[i - 1].users - transformedData.users : 0;
    transformedData.step = i + 1;
    return transformedData;
  });
};

export const filterFunnelSteps = (steps: FunnelStep[]) => {
  return steps.filter((data, i) => data?.['event']);
};

export const isEveryFunnelStepFiltersValid = (funnelSteps: FunnelStep[]) => {
  return funnelSteps.every((funnelStep) => {
    return funnelStep.filters.every((filter) => filter.values.length);
  });
};

export const replaceEmptyStringPlaceholder = (funnelSteps: FunnelStep[]) => {
  return funnelSteps.map((step) => {
    step.filters.map((filter) => {
      const emptyStringIndex = filter.values.indexOf('(empty string)');
      if (emptyStringIndex !== -1) filter.values[emptyStringIndex] = '';
      return filter;
    });
    return step;
  });
};

export const replaceFilterValueWithEmptyStringPlaceholder = (
  funnelSteps: FunnelStep[]
) => {
  return funnelSteps.map((step) => {
    step.filters.map((filter) => {
      const emptyStringIndex = filter.values.indexOf('');
      if (emptyStringIndex !== -1)
        filter.values[emptyStringIndex] = '(empty string)';
      return filter;
    });
    return step;
  });
};

export const stepsSequence = [
  { label: 'In sequence', value: false },
  { label: 'Any order', value: true }, // random sequence
];
