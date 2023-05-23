import { ApperturePost } from '@lib/services/util';

export const getTransientColumns = (dsId: string, query: string) => {
  return ApperturePost(`/spreadsheets/transient/${dsId}`, {
    query: query,
  });
};
