import { ActionGroup } from './../domain/action';
import { AppertureGet, ApperturePost, ApperturePut } from './util';

export const getSavedActionsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/actions?datasource_id=${dsId}`);
  return res.data;
};

export const saveAction = async (
  name: string,
  dsId: string,
  groups: ActionGroup[]
) => {
  return await ApperturePost('/actions', {
    name,
    datasourceId: dsId,
    groups,
  });
};

export const updateAction = async (
  id: string,
  name: string,
  dsId: string,
  groups: ActionGroup[]
) => {
  return await ApperturePut(`/actions/${id}`, {
    name,
    datasourceId: dsId,
    groups,
  });
};

export const getTransientActions = async (
  dsId: string,
  groups: ActionGroup[]
) => {
  const res = await ApperturePost('/actions/transient', {
    datasourceId: dsId,
    groups,
  });
  return res.data || [];
};
