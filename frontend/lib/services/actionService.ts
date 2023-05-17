import { DateFilterObj } from '@lib/domain/common';
import { filterEmptyActionSelectors } from '@components/Actions/utils';
import { ActionGroup } from '@lib/domain/action';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';
import cloneDeep from 'lodash/cloneDeep';

export const getSavedActionsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/actions?datasource_id=${dsId}`);
  return res.data;
};

export const saveAction = async (
  dsId: string,
  name: string,
  groups: ActionGroup[]
) => {
  return await ApperturePost('/actions', {
    name,
    datasourceId: dsId,
    groups: filterEmptyActionSelectors(cloneDeep(groups)),
  });
};

export const updateAction = async (
  id: string,
  dsId: string,
  name: string,
  groups: ActionGroup[]
) => {
  return await ApperturePut(`/actions/${id}`, {
    name,
    datasourceId: dsId,
    groups: filterEmptyActionSelectors(cloneDeep(groups)),
  });
};

export const getTransientActionEvents = async (
  dsId: string,
  groups: ActionGroup[],
  dateFilter: DateFilterObj
) => {
  const res = await ApperturePost('/actions/transient', {
    datasourceId: dsId,
    groups: filterEmptyActionSelectors(cloneDeep(groups)),
    dateFilter,
  });
  return res.data || [];
};

export const _getSavedAction = async (id: string, token: string) => {
  const res = await ApperturePrivateGet(`/actions/${id}`, token);
  return res.data;
};

export const deleteAction = async (id: string) => {
  const res = await AppertureDelete(`/actions/${id}`);
  return res.data || undefined;
};
