import axios from 'axios';
import { getAuthToken } from './auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = (config.headers ?? {}) as any;
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});
