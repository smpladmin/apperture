import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { AxiosError } from 'axios';

export const AppertureGetCall = async (path: string) => {
  try {
    return await AppertureAPI.get(path);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePrivateGetCall = async (token: string, path: string) => {
  try {
    return await ApperturePrivateAPI.get(path, {
      headers: { Authorization: token },
    });
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePostCall = async (
  path: string,
  payload: {
    [key: string]: string | number | boolean | Array<any> | object | null;
  }
) => {
  try {
    return await AppertureAPI.post(path, payload);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePutCall = async (
  path: string,
  payload: { [key: string]: string | number | Array<any> | object | null }
) => {
  try {
    return await AppertureAPI.put(path, payload);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};
