import { AppertureAPI } from '@lib/apiClient';
import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export type ErrorResponse = {
  status: number;
  data: undefined;
  error: {
    detail: string;
  };
};

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
    return {
      status: error.response?.status,
      error: error.response?.data || { detail: '' },
      data: undefined,
    } as ErrorResponse;
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
    return {
      status: error.response?.status,
      error: error.response?.data || { detail: '' },
      data: undefined,
    } as ErrorResponse;
  }
};

export const ApperturePost = async (
  path: string,
  payload:
    | {
        [key: string]: string | number | boolean | Array<any> | object | null;
      }
    | any[]
    | FormData,
  config: AxiosRequestConfig = {}
) => {
  try {
    return await AppertureAPI.post(path, payload, config);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return {
      status: error.response?.status,
      error: error.response?.data || { detail: '' },
      data: undefined,
    } as ErrorResponse;
  }
};

export const ApperturePut = async (
  path: string,
  payload: {
    [key: string]:
      | string
      | number
      | boolean
      | Array<any>
      | object
      | null
      | string[];
  }
) => {
  try {
    return await AppertureAPI.put(path, payload);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return {
      status: error.response?.status,
      error: error.response?.data || { detail: '' },
      data: undefined,
    } as ErrorResponse;
  }
};

export const AppertureDelete = async (path: string) => {
  try {
    return await AppertureAPI.delete(path);
  } catch (e) {
    const error = e as AxiosError;
    console.error(error.message);
    return {
      status: error.response?.status,
      error: error.response?.data || { detail: '' },
      data: undefined,
    } as ErrorResponse;
  }
};
