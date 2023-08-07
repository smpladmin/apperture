import { ApperturePrivateAPI } from './../apiClient/client.server';
import { AppertureAPI } from '../apiClient';
import { AxiosError } from 'axios';
import { AppertureGet } from './util';

export const _getAppertureUserInfo = async (token: string) => {
  try {
    const user = await ApperturePrivateAPI.get('/apperture-users/me', {
      headers: { Authorization: token },
    });
    return user.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {};
  }
};

export const getAppertureUserInfo = async () => {
  try {
    const user = await AppertureAPI.get('/apperture-users/me');
    return user.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {};
  }
};

export const removeSlackCredentials = async () => {
  try {
    await AppertureAPI.put('/apperture-users?delete_slack_credentials=true');
  } catch (e) {
    console.error((e as AxiosError).message);
  }
};

export const get_apperture_users = async (appId: string | null) => {
  const url = appId ? `/apperture-users?app_id=${appId}` : `/apperture-users`;
  const res = await AppertureGet(url);
  return res.data;
};
