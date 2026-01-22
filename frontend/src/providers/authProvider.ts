import { AuthProvider } from '@refinedev/core';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const TOKEN_KEY = 'gymapp_token';
export const USER_KEY = 'gymapp_user';

export const authProvider: AuthProvider = {
  login: async ({ email, password, code, type }) => {
    try {
      let endpoint = '/auth/login';
      let payload: any = {};

      // Login para members (por código)
      if (type === 'member' && code) {
        endpoint = '/auth/login/member';
        payload = { code };
      } else {
        // Login para super admin, admin gym, recepcionista
        payload = { email, password };
      }

      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        // Configurar axios para usar el token en todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        return {
          success: true,
          redirectTo: '/',
        };
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Credenciales inválidas',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error?.response?.data?.message || 'Error al iniciar sesión',
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];

    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      // Configurar axios con el token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: 'No autenticado',
        name: 'Unauthorized',
      },
      logout: true,
      redirectTo: '/login',
    };
  },

  getPermissions: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  },

  getIdentity: async () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        name: user.name || user.email,
        avatar: user.avatar,
        role: user.role,
      };
    }
    return null;
  },

  onError: async error => {
    if (error.response?.status === 401) {
      return {
        logout: true,
        redirectTo: '/login',
        error,
      };
    }

    return { error };
  },
};
