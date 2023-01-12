import {
  FilterType,
  SegmentDateFilterType,
  SegmentFilter,
  SegmentFilterDataType,
  SegmentFilterOperatorsBool,
  SegmentFilterOperatorsNumber,
  SegmentFilterOperatorsString,
  SegmentGroup,
} from '@lib/domain/segment';
import { format } from 'date-fns';

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

export const FilterOperatorsDatatypeMap = {
  [SegmentFilterDataType.BOOL]: Object.values(SegmentFilterOperatorsBool),
  [SegmentFilterDataType.NUMBER]: Object.values(SegmentFilterOperatorsNumber),
  [SegmentFilterDataType.STRING]: Object.values(SegmentFilterOperatorsString),
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

export const getDateStringFromDate = (recievedDate: Date) => {
  if (!recievedDate) return '';
  return format(recievedDate, 'yyyy-MM-dd');
};

export const getMonthDateYearFormattedString = (dateString: string) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy');
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
