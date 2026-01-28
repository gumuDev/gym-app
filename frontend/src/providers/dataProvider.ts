import dataProviderSimpleRest from '@refinedev/simple-rest';
import axios from 'axios';
import { TOKEN_KEY, USER_KEY, API_URL } from '../constants/auth';

// Configurar axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token en cada request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
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
  response => {
    // Transformar respuesta del backend { success, data } a formato Refine { data }
    if (response.data?.success && response.data?.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Crear el data provider de Refine
export const dataProvider = dataProviderSimpleRest(API_URL, axiosInstance as any);
