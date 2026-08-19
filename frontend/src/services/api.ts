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
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || '';
    const reqUrl = config?.url || '';

    const isTimeoutOrNetworkError =
      error.code === 'ECONNABORTED' ||
      !error.response ||
      status === 503 ||
      status === 504 ||
      (error.message && error.message.toLowerCase().includes('timeout'));

    // Retry once for GET requests if cold-start network error / timeout occurs
    if (isTimeoutOrNetworkError && config && !config._retry && (config.method === 'get' || reqUrl.includes('/public/ping'))) {
      config._retry = true;
      await new Promise((res) => setTimeout(res, 2000));
      return API(config);
    }

    // Handle timeout / connection abort errors gracefully
    if (isTimeoutOrNetworkError) {
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

// Trigger background server warmup ping on initial module load
if (typeof window !== 'undefined') {
  API.get('/public/ping').catch(() => {});
}

export default API;
