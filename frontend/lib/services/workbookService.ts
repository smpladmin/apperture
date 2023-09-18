import {
  AIQuery,
  PivotAxisDetail,
  PivotValueDetail,
  Spreadsheet,
} from '@lib/domain/workbook';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from '@lib/services/util';

const mapApiResponseToDisplayOriginalFormat = (rows: any[]) => {
  return rows.map((row) => {
    const dataKeys = Object.keys(row);

    dataKeys.forEach((key) => {
      let displayValue = row[key];
      if (typeof row[key] === 'number') {
        displayValue = Math.round(displayValue * 100) / 100;
      }
      row[key] = { original: row[key], display: displayValue };
    });
    return row;
  });
};

export const getTransientSpreadsheets = async (
  dsId: string,
  query: string,
  is_sql: boolean = true,
  aiQuery?: AIQuery,
  isDatamart: boolean = false,
  signal?: AbortSignal
) => {
  const res = await ApperturePost(
    `/workbooks/spreadsheets/transient`,
    {
      datasourceId: dsId,
      query: query,
      is_sql,
      isDatamart,
      ai_query: aiQuery
        ? {
            nl_query: aiQuery.nlQuery,
            word_replacements: aiQuery.wordReplacements,
            table: aiQuery.table,
            database: aiQuery.database,
          }
        : null,
    },
    {
      signal,
    }
  );
  const data = mapApiResponseToDisplayOriginalFormat(res.data?.data || []);
  return { ...res, data: { ...res.data, data } };
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

  const data = mapApiResponseToDisplayOriginalFormat(res.data?.data || []);
  return { ...res, data: { ...res.data, data } };
};

export const getTransientPivot = async (
  dsId: string,
  query: string,
  rows: PivotAxisDetail[],
  columns: PivotAxisDetail[],
  values: PivotValueDetail[]
) => {
  return await ApperturePost(`/workbooks/spreadsheets/pivot/transient`, {
    dsId,
    query,
    rows,
    columns,
    values,
  });
};

export const vlookup = async (
  datasourceId: string,
  searchQuery: string,
  lookupQuery: string,
  searchKeyColumn: string,
  lookupColumn: string,
  lookupIndexColumn: string
) => {
  const res = await ApperturePost(`/workbooks/vlookup`, {
    datasourceId,
    searchQuery,
    lookupQuery,
    searchKeyColumn,
    lookupColumn,
    lookupIndexColumn,
  });
  return res.data || [];
};
