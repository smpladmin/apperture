import axios from 'axios';

export const AppertureAPI = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});
