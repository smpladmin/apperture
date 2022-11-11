import { FunnelStep } from '@lib/domain/funnel';

export const getCountOfValidAddedSteps = (
  steps: FunnelStep[],
  nodes: any[]
) => {
  return steps.reduce((count, step) => {
    if (isValidStep(step?.['event'], nodes)) ++count;
    return count;
  }, 0);
};

export const isValidStep = (stepName: string, steps: any[]) => {
  return steps.some((s) => s?.id === stepName);
};

export const filterEmptySteps = (steps: FunnelStep[]) => {
  return steps.filter((step) => step?.['event']);
};
