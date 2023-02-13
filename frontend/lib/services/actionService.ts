import { filterEmptyActionSelectors } from './../../components/Actions/utils';
import { CaptureEvent } from '@lib/domain/action';
import { ActionGroup } from './../domain/action';
import {
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
  ApperturePut,
} from './util';
import { cloneDeep } from 'lodash';

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

export const getTransientActions = async (
  dsId: string,
  groups: ActionGroup[],
  event: CaptureEvent
) => {
  const res = await ApperturePost('/actions/transient', {
    datasourceId: dsId,
    groups: filterEmptyActionSelectors(cloneDeep(groups)),
    event,
  });
  return res.data || [];
};

export const _getSavedAction = async (id: string, token: string) => {
  const res = await ApperturePrivateGet(`/actions/${id}`, token);
  return res.data;
};
