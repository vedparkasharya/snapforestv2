import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    return api.post('/auth/logout');
  },
  me: () => api.get('/auth/me'),
  updateProfile: (data: { name: string }) => api.put('/auth/profile', data)
};

// Image APIs
export const images = {
  generate: (data: { prompt: string; style?: string; aspectRatio?: string }) =>
    api.post('/images/generate', data),
  save: (data: { imageBase64: string; prompt: string; title?: string; style?: string; aspectRatio?: string }) =>
    api.post('/images/save', data),
  getMyImages: (page?: number, limit?: number) =>
    api.get(`/images/my-images?page=${page || 1}&limit=${limit || 12}`),
  delete: (id: string) => api.delete(`/images/${id}`)
};

// Gallery APIs
export const gallery = {
  getAll: (page?: number, limit?: number, style?: string) =>
    api.get(`/gallery?page=${page || 1}&limit=${limit || 20}&style=${style || 'all'}`),
  getById: (id: string) => api.get(`/gallery/${id}`),
  like: (id: string) => api.post(`/gallery/${id}/like`)
};

// Payment APIs
export const payments = {
  getPlans: () => api.get('/payments/plans'),
  createOrder: (plan: string) => api.post('/payments/create-order', { plan }),
  verify: (data: { orderId: string; paymentId: string; signature: string }) =>
    api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history')
};

export default api;
