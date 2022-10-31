import { ApperturePrivateAPI } from './../apiClient/client.server';
import { AppertureAPI } from '../apiClient';
import { AxiosError } from 'axios';

export const _getUserInfo = async (token: string) => {
  try {
    const user = await ApperturePrivateAPI.get('/users/me', {
      headers: { Authorization: token },
    });
    return user.data;
  } catch (e) {
    console.error((e as AxiosError).message);
    return {};
  }
};

export const removeSlackCredentials = async () => {
  try {
    await AppertureAPI.delete('/users/slack_credentials');
  } catch (e) {
    console.error((e as AxiosError).message);
  }
};
