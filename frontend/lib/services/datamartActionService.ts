import { ActionType, ActionMeta, Schedule } from '@lib/domain/datamartActions';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';

export const saveDatamartAction = async (
  datamartId: string,
  actionType: ActionType,
  meta: ActionMeta,
  schedule: Schedule
) => {
  return await ApperturePost(`/datamart_actions`, {
    datamartId,
    type: actionType,
    meta,
    schedule,
  });
};

export const updateDatamartAction = async (
  id: string,
  datamartId: string,
  actionType: ActionType,
  meta: ActionMeta,
  schedule: Schedule
) => {
  return await ApperturePut(`/datamart_actions/${id}`, {
    datamartId,
    type: actionType,
    meta,
    schedule,
  });
};

export const _getSavedDatamartAction = async (
  token: string,
  dataMartId: string
) => {
  const res = await ApperturePrivateGet(
    `/datamart_actions/${dataMartId}`,
    token
  );
  return res.data;
};

export const _getSavedDatamartActionsForDatamartId = async (
  datamartId: string,
  token: string
) => {
  const res = await ApperturePrivateGet(
    `/datamart_actions?datamart_id=${datamartId}`,
    token
  );
  return res.data;
};

export const deleteDatamartAction = async (id: string) => {
  return await AppertureDelete(`/datamart_actions/${id}`);
};

export const getGoogleSpreadsheets = async () => {
  return await AppertureGet(`/datamart_actions/google/spreadsheets`);
};

export const getSpreadsheetSheets = async (id: string) => {
  return await AppertureGet(`/datamart_actions/google/sheets/${id}`);
};
