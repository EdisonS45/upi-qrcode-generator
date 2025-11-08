import axios from 'axios';

// --- FIX: Use VITE environment variable for the base URL ---
// Vercel/Vite injects VITE_ prefixed environment variables into the client bundle.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;