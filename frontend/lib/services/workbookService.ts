import { Spreadsheet, WordReplacement } from '@lib/domain/workbook';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from '@lib/services/util';

const convertAPIResponseToDesiredFormat = (rows: any[]) => {
  return rows.map((row) => {
    const dataKeys = Object.keys(row);

    dataKeys.forEach((key) => {
      row[key] = { original: row[key], display: row[key] };
    });
    return row;
  });
};

export const getTransientSpreadsheets = async (
  dsId: string,
  query: string,
  is_sql: boolean = true,
  word_replacements: Array<WordReplacement> = [],
  signal?: AbortSignal
) => {
  const res = await ApperturePost(
    `/workbooks/spreadsheets/transient`,
    {
      datasourceId: dsId,
      query: query,
      is_sql,
      word_replacements,
    },
    {
      signal,
    }
  );

  const data = convertAPIResponseToDesiredFormat(res.data.data);
  return { data: { ...res.data, data }, status: res.status };
};

export const getSavedWorkbooksForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/workbooks?datasource_id=${dsId}`);
  return res.data;
};

export const getSavedWorkbooksForApp = async (appId: string) => {
  const res = await AppertureGet(`/workbooks?app_id=${appId}`);
  return res.data || [];
};

export const _getSavedWorkbook = async (token: string, workbookId: string) => {
  const res = await ApperturePrivateGet(`/workbooks/${workbookId}`, token);
  return res.data;
};

export const deleteWorkbook = async (id: string) => {
  return await AppertureDelete(`/workbooks/${id}`);
};

export const saveWorkbook = async (
  dsId: string,
  name: string,
  sheets: Spreadsheet[]
) => {
  return await ApperturePost(`/workbooks`, {
    datasourceId: dsId,
    name,
    spreadsheets: sheets,
  });
};

export const updateWorkbook = async (
  workbookId: string,
  dsId: string,
  name: string,
  sheets: Spreadsheet[]
) => {
  return await ApperturePut(`/workbooks/${workbookId}`, {
    datasourceId: dsId,
    name,
    spreadsheets: sheets,
  });
};

export const getWorkbookTransientColumn = async (
  datasourceId: string,
  dimensions: any[],
  metrics: any[],
  database: string,
  table: string
) => {
  const res = await ApperturePost(`/workbooks/spreadsheets/columns/transient`, {
    datasourceId,
    dimensions,
    metrics,
    database,
    table,
  });

  const data = convertAPIResponseToDesiredFormat(res.data.data);
  return { data: { ...res.data, data }, status: res.status };
};
