import { NodeType } from '@lib/types/graph';
import { FunnelStep } from '@lib/domain/funnel';

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
