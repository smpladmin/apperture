import { ApperturePost } from '@lib/services/util';

export const getTransientSpreadsheets = (dsId: string, query: string) => {
  return ApperturePost(`/spreadsheets/transient`, {
    datasourceId: dsId,
    query: query,
  });
};
