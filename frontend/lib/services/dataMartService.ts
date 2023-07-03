import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';

export const computeDataMartQuery = async (
  datasourceId: string,
  query: string,
  is_sql: boolean
) => {
  return await ApperturePost(`/datamart/transient`, {
    datasourceId: datasourceId,
    query: query,
    is_sql,
  });
};

export const saveDataMartTable = async (
  datasourceId: string,
  query: string,
  name: string
) => {
  return await ApperturePost(`/datamart`, {
    datasourceId: datasourceId,
    query: query,
    name: name,
  });
};

export const updateDataMartTable = async (
  dataMartTableId: string,
  datasourceId: string,
  query: string,
  name: string
) => {
  return await ApperturePut(`/datamart/${dataMartTableId}`, {
    datasourceId: datasourceId,
    query: query,
    name: name,
  });
};

export const _getSavedDataMart = async (token: string, dataMartId: string) => {
  const res = await ApperturePrivateGet(`/datamart/${dataMartId}`, token);
  return res.data;
};

export const getSavedDataMartsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/datamart?datasource_id=${dsId}`);
  return res.data;
};

export const deleteDataMart = async (id: string) => {
  return await AppertureDelete(`/datamart/${id}`);
};
