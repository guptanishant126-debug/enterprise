import axios from 'axios';

const PRODUCTION_API_URL = 'https://enterprise-1l1e.onrender.com/api';

// Smart Base URL resolution:
// 1. If custom endpoint saved in browser localStorage (nexus_api_url)
// 2. If explicitly configured in Vercel/Render env (VITE_API_BASE_URL)
// 3. If running on a deployed domain (like *.vercel.app), default to Render backend URL
// 4. If running locally, default to 'http://localhost:5000/api'
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nexus_api_url');
    if (saved && saved.trim()) return saved.trim();
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim();
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_API_URL;
  }
  return 'http://localhost:5000/api';
};

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      const normalized = url.trim().replace(/\/$/, '');
      const finalUrl = normalized.endsWith('/api') ? normalized : `${normalized}/api`;
      localStorage.setItem('nexus_api_url', finalUrl);
      api.defaults.baseURL = finalUrl;
    } else {
      localStorage.removeItem('nexus_api_url');
      api.defaults.baseURL = getApiBaseUrl();
    }
  }
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/unauthorized
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Initiative Services
export const initiativeApi = {
  getAll: (params) => api.get('/initiatives', { params }),
  getById: (id) => api.get(`/initiatives/${id}`),
  create: (data) => api.post('/initiatives', data),
  updateStage: (id, payload) => api.patch(`/initiatives/${id}/stage`, payload),
  reEvaluate: (id) => api.post(`/initiatives/${id}/re-evaluate`)
};

// Workflow Services
export const workflowApi = {
  getBoard: (params) => api.get('/workflows/board', { params })
};

// Intelligence Services
export const intelligenceApi = {
  query: (payload) => api.post('/intelligence/query', payload)
};

// Governance & Metrics Services
export const metricsApi = {
  getDashboard: () => api.get('/metrics/dashboard')
};

export const auditApi = {
  getLogs: (params) => api.get('/audit-logs', { params })
};

export default api;
