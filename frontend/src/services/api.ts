import axios from 'axios';

const getApiBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').trim().replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const getImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120s timeout to accommodate cloud host cold starts (e.g. Render spin-up)
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => {
    if (localStorage.getItem('userBlocked')) {
      localStorage.removeItem('userBlocked');
      window.dispatchEvent(new Event('userUnblocked'));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const reqUrl = error.config?.url || '';

    // Handle timeout / connection abort errors gracefully
    if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      error.message = 'Server request timed out. The backend service may be waking up from sleep. Please try again in a few seconds.';
    }

    // Ignore 401/403 handling for /auth/ endpoints (login, register, forgot-password)
    if ((status === 401 || status === 403) && !reqUrl.includes('/auth/')) {
      if (message.toLowerCase().includes('blocked') || message.toLowerCase().includes('locked')) {
        localStorage.setItem('userBlocked', 'true');
        window.dispatchEvent(new Event('userBlocked'));
        return Promise.reject(error);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userBlocked');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
