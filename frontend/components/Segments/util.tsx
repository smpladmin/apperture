import {
  FilterType,
  SegmentFilterConditions,
  SegmentGroup,
} from '@lib/domain/segment';

export const getFilteredColumns = (columns: string[]) => {
  return columns.filter((value) => value !== 'user_id');
};

const _getWhereAndWhoConditionIndex = (
  conditions: SegmentFilterConditions[]
) => {
  const whereConditionIndex = conditions.indexOf(SegmentFilterConditions.WHERE);
  const whoConditionIndex = conditions.indexOf(SegmentFilterConditions.WHO);
  return { whereConditionIndex, whoConditionIndex };
};

export const getWhereAndWhoConditionsList = (
  conditions: SegmentFilterConditions[]
) => {
  const { whereConditionIndex, whoConditionIndex } =
    _getWhereAndWhoConditionIndex(conditions);

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
  return groups.map((group) => {
    group.filters.map((filter) => {
      const emptyStringIndex = filter.values.indexOf('(empty string)');
      if (emptyStringIndex !== -1) filter.values[emptyStringIndex] = '';
      return filter;
    });
    return group;
  });
};

export const addTypeForFiltersInSavedSegmentResponse = (
  groups: SegmentGroup[]
) => {
  return groups.map((group) => {
    const { whereConditionIndex, whoConditionIndex } =
      _getWhereAndWhoConditionIndex(group.conditions);

    group.filters.map((filter, index) => {
      if (whoConditionIndex === -1 || index < whoConditionIndex) {
        filter['type'] = FilterType.WHERE;
      } else {
        filter['type'] = FilterType.WHO;
      }
      return filter;
    });
    return group;
  });
};

export const getDateStringFromDate = (date: Date) => {
  const [dateString] = date.toISOString().split('T');
  return dateString;
};

export const getDateOfNDaysBack = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getDateStringFromDate(date);
};

export const getNumberOfDaysBetweenDates = (
  startDate: string,
  endDate: string
) => {
  const diff = new Date(endDate)?.valueOf() - new Date(startDate)?.valueOf();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
