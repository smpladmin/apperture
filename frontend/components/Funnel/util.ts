import { NodeType } from '@lib/types/graph';
import { FunnelStep, FunnelData } from '@lib/domain/funnel';

export const getCountOfValidAddedSteps = (
  steps: FunnelStep[],
  nodes: NodeType[]
) => {
  return steps.reduce((count, step) => {
    if (isValidStep(step?.['event'], nodes)) ++count;
    return count;
  }, 0);
};

export const isValidStep = (stepName: string, nodes: NodeType[]) => {
  return nodes.some((node) => node?.id === stepName);
};

export const isEveryStepValid = (steps: FunnelStep[], nodes: NodeType[]) => {
  return steps.every((step) => isValidStep(step?.['event'], nodes));
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

export const isValidNonEmptyStep = (stepName: string, nodes: NodeType[]) => {
  return !stepName || isValidStep(stepName, nodes);
};

export const isEveryNonEmptyStepValid = (
  steps: FunnelStep[],
  nodes: NodeType[]
) => {
  return steps.every((step) => isValidNonEmptyStep(step?.['event'], nodes));
};

export const isEveryFunnelStepFiltersValid = (funnelSteps: FunnelStep[]) => {
  return funnelSteps.every((funnelStep) => {
    return funnelStep.filters.every((filter) => filter.values.length);
  });
};
