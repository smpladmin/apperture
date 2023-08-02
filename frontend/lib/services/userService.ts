import { ApperturePrivateAPI } from './../apiClient/client.server';
import { AppertureAPI } from '../apiClient';
import { AxiosError } from 'axios';

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

export const updateSheetsVisitedStatus = async () => {
  try {
    await AppertureAPI.put('/apperture-users?has_visited_sheets=true');
  } catch (e) {
    console.error((e as AxiosError).message);
  }
};
