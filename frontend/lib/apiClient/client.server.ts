import axios from 'axios';
import getConfig from 'next/config';
const { serverRuntimeConfig: config } = getConfig();

export const ApperturePrivateAPI = axios.create({
  baseURL: config.BACKEND_BASE_URL,
});
