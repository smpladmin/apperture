import { Spreadsheet } from '@lib/domain/workbook';
import {
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from '@lib/services/util';

export const getTransientSpreadsheets = (
  dsId: string,
  query: string,
  is_sql: boolean
) => {
  return ApperturePost(`/workbooks/spreadsheets/transient`, {
    datasourceId: dsId,
    query: query,
    is_sql,
  });
};

export const getSavedWorkbooksForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/workbooks?datasource_id=${dsId}`);
  return res.data;
};

export const _getSavedWorkbook = async (token: string, workbookId: string) => {
  const res = await ApperturePrivateGet(`/workbooks/${workbookId}`, token);
  return res.data;
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
  metrics: any[]
) => {
  return await ApperturePost(`/workbooks/spreadsheets/columns/transient`, {
    datasourceId,
    dimensions,
    metrics,
  });
};
