import axios from 'axios';

export const ApperturePrivateAPI = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
});
