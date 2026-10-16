import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusfind_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors & 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | Array<{ loc: string[]; msg: string }>; message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem('campusfind_token');
      localStorage.removeItem('campusfind_user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Format Axios / FastAPI errors into human-readable error messages.
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      // FastAPI single detail string
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      // FastAPI validation error array (422)
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
            return `${field}: ${err.msg}`;
          })
          .join(', ');
      }
      // General message field
      if (data.message) {
        return data.message;
      }
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 500) {
      return 'Internal server error. Please try again later.';
    }
    if (error.message === 'Network Error') {
      return 'Unable to connect to server. Please ensure the backend is running.';
    }
    return error.message || 'An unexpected error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};
