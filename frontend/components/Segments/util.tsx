import {
  FilterType,
  SegmentDateFilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentGroup,
} from '@lib/domain/segment';

export const DateFilterTypeOptions = [
  {
    id: SegmentDateFilterType.FIXED,
    label: 'Fixed',
  },
  {
    id: SegmentDateFilterType.SINCE,
    label: 'Since',
  },
  {
    id: SegmentDateFilterType.LAST,
    label: 'Last',
  },
];

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

export const getWhereAndWhoFilters = (filters: SegmentFilter[]) => {
  const whereFilters = filters.filter(
    (filter) => filter.type === FilterType.WHERE
  );
  const whoFilters = filters.filter((filter) => filter.type === FilterType.WHO);

  return { whereFilters, whoFilters };
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

export const replaceFilterValueWithEmptyStringPlaceholder = (
  groups: SegmentGroup[]
) => {
  return groups.map((group) => {
    group.filters.map((filter) => {
      const emptyStringIndex = filter.values.indexOf('');
      if (emptyStringIndex !== -1)
        filter.values[emptyStringIndex] = '(empty string)';
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
