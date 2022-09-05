import { ApperturePrivateAPI } from '@lib/apiClient/client.server';
import { App } from '@lib/domain/app';
import { AxiosError } from 'axios';
import { AppertureAPI } from '../apiClient';

export const addApp = async (name: string): Promise<App | null> => {
  try {
    const app = await AppertureAPI.post('/apps', {
      name,
    });
    return app.data;
  } catch (error) {
    console.log((error as AxiosError).message);
    return null;
  }
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

export const getApps = async (): Promise<Array<App>> => {
  try {
    const res = await AppertureAPI.get('/apps');
    return res.data;
  } catch (e) {
    console.log((e as AxiosError).message);
    return [];
  }
};
