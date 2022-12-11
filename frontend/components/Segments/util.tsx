import { SegmentGroup } from '@lib/domain/segment';

export const getFilteredColumns = (columns: string[]) => {
  return columns.filter((value) => value !== 'user_id');
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
