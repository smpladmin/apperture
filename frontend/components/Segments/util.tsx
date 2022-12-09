import { SegmentGroup } from '@lib/domain/segment';

export const getFilteredColumns = (columns: string[]) => {
  return columns.filter((value) => value !== 'user_id');
};

export const replaceEmptyStringPlaceholder = (groups: SegmentGroup[]) => {
  return groups.map((group) => {
    return group.filters.map((filter) => {
      const index = filter.values.indexOf('(empty string)');
      if (index !== -1) filter.values[index] = '';
      return filter;
    });
  })[0];
};
