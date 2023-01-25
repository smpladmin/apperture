import axios from 'axios';
import { BACKEND_BASE_URL } from 'config';

export const AppertureAPI = axios.create({
  withCredentials: true,
  baseURL: BACKEND_BASE_URL,
  headers: {
    'cache-control': 'max-age',
    Pragma: 1,
  },
});
