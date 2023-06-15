import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { App, AppWithIntegrations } from '@lib/domain/app';
import { AxiosError, AxiosResponse } from 'axios';
import { AppertureAPI } from '../apiClient';
import { ApperturePost, ErrorResponse } from './util';

export const addApp = async (name: string) => {
  return await ApperturePost('/apps', {
    name,
  });
};

export const _getApp = async (id: string, token: string): Promise<App> => {
  const res = await ApperturePrivateAPI.get(`/apps/${id}`, {
    headers: { Authorization: token },
  });
  return res.data;
};

/* 
  Apperture convention: Prefix server side calls with an underscore.
  This indicates these are private calls, 
  and should be used in Next's getServerSideProps
*/
export const _getApps = async (token: string): Promise<Array<App>> => {
  try {
    const res = await ApperturePrivateAPI.get('/apps', {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (e) {
    console.log((e as AxiosError).message);
    return [];
  }
};

export const _getAppsWithIntegrations = async (
  token: string
): Promise<Array<AppWithIntegrations>> => {
  try {
    const res = await ApperturePrivateAPI.get('/apps', {
      headers: { Authorization: token },
      params: { with_integrations: true },
    });
    return res.data;
  } catch (e) {
    console.log((e as AxiosError).message);
    return [];
  }
};

export const getApps = async (): Promise<Array<App>> => {
  try {
    const res = await AppertureAPI.get('/apps');
    return res.data;
  } catch (e) {
    console.log((e as AxiosError).message);
    return [];
  }
};
