import dataProviderSimpleRest from '@refinedev/simple-rest';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token en cada request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('gymapp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymapp_token');
      localStorage.removeItem('gymapp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Crear el data provider de Refine
export const dataProvider = dataProviderSimpleRest(API_URL, axiosInstance);
