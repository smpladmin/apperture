import axios from 'axios';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});

export const privateHttp = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
});
