import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

