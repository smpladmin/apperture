import { ApperturePost } from '@lib/services/util';

export const getTransientSpreadsheets = (
  dsId: string,
  query: string,
  is_sql: boolean
) => {
  return ApperturePost(`/spreadsheets/transient`, {
    datasourceId: dsId,
    query: query,
    is_sql,
  });
};
