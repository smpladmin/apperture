import axios from 'axios';
import getConfig from 'next/config';
const { publicRuntimeConfig: config } = getConfig();

export const AppertureAPI = axios.create({
  withCredentials: true,
  baseURL: config.PUBLIC_BACKEND_BASE_URL,
});
