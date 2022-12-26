import { SegmentFilterConditions, SegmentGroup } from '@lib/domain/segment';

export const getFilteredColumns = (columns: string[]) => {
  return columns.filter((value) => value !== 'user_id');
};

export const getWhereAndWhoConditionsList = (
  conditions: SegmentFilterConditions[]
) => {
  const whereConditionIndex = conditions.indexOf(SegmentFilterConditions.WHERE);
  const whoConditionIndex = conditions.indexOf(SegmentFilterConditions.WHO);

  // note: 'where' conditions would always be present before 'who' conditions
  // therefore, while finding 'where' conditions be sure to check whether 'who' condition is present
  // incase, no 'who' condition is found that signifies that all the conditions are 'where' conditions

  const whereConditions =
    whereConditionIndex === -1
      ? []
      : whoConditionIndex === -1
      ? conditions.slice(whereConditionIndex)
      : conditions.slice(whereConditionIndex, whoConditionIndex);

  const whoConditions =
    whoConditionIndex === -1 ? [] : conditions.slice(whoConditionIndex);

  return { whereConditions, whoConditions };
};

export const replaceEmptyStringPlaceholder = (groups: SegmentGroup[]) => {
  return groups.flatMap((group) => {
    group.filters.flatMap((filter) => {
      const emptyStringIndex = filter.values.indexOf('(empty string)');
      if (emptyStringIndex !== -1) filter.values[emptyStringIndex] = '';
      return filter;
    });
    return group;
  });
};
