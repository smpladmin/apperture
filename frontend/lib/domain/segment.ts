export type SegmentFilter = {
  operand: string;
  operator: string;
  values: string[];
};

export enum SegmentFilterConditions {
  WHERE = 'where',
  AND = 'and',
  OR = 'or',
}

export type SegmentGroup = {
  filter: SegmentFilter[];
  conditions: SegmentFilterConditions[];
};
