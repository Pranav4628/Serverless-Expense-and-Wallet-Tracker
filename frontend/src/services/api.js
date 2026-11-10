/**
 * api.js
 * Configured Axios instance with JWT request interceptor and 401 auto-logout.
 */
import axios from 'axios';

// Validate the base URL. If it is a placeholder or missing, use a relative
// path so Axios does not throw 'Invalid URL' on every page load.
function getBaseURL() {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url || url.includes('<api-id>') || url.startsWith('https://<')) {
    return null; // will be handled per-request
  }
  try {
    new URL(url);   // throws if url is not valid
    return url;
  } catch {
    return null;
  }
}

const BASE_URL = getBaseURL();

export const isApiConfigured = !!BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — inject Authorization header
apiClient.interceptors.request.use(
  (config) => {
    if (!BASE_URL) {
      // Block the request entirely — backend is not configured yet
      return Promise.reject(
        Object.assign(new Error('API_NOT_CONFIGURED'), { isApiNotConfigured: true })
      );
    }
    const token =
      localStorage.getItem('fintrack_id_token') ||
      localStorage.getItem('fintrack_access_token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 auto-logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fintrack_access_token');
      localStorage.removeItem('fintrack_id_token');
      localStorage.removeItem('fintrack_user');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default apiClient;