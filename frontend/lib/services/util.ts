import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { AxiosError, AxiosRequestConfig } from 'axios';

export const AppertureGet = async (
  path: string,
  config: AxiosRequestConfig = {
    headers: { 'cache-control': 'max-age', Pragma: 1 },
  }
) => {
  try {
    return await AppertureAPI.get(path, config);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePrivateGet = async (
  path: string,
  token: string,
  config: AxiosRequestConfig = {}
) => {
  try {
    return await ApperturePrivateAPI.get(path, {
      headers: { Authorization: token },
      ...config,
    });
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePost = async (
  path: string,
  payload:
    | {
        [key: string]: string | number | boolean | Array<any> | object | null;
      }
    | any[],
  config: AxiosRequestConfig = {}
) => {
  try {
    return await AppertureAPI.post(path, payload, config);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};

export const ApperturePut = async (
  path: string,
  payload: {
    [key: string]: string | number | boolean | Array<any> | object | null;
  }
) => {
  try {
    return await AppertureAPI.put(path, payload);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return { status: error.response?.status, data: undefined };
  }
};
