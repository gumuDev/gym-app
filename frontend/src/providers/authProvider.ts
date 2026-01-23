import axios from 'axios';
import { TOKEN_KEY, USER_KEY, API_URL } from '../constants/auth';

export const authProvider = {
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

      console.log('🔐 Intentando login en:', `${API_URL}${endpoint}`);
      console.log('📦 Payload:', payload);

      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

      console.log('✅ Respuesta del servidor:', data);

      // El backend devuelve { success, data: { token, user } }
      const responseData = data.data || data;
      const token = responseData.token;
      const user = responseData.user;

      if (token && user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Configurar axios para usar el token en todas las peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Determinar redirección según rol
        const role = user.role?.toLowerCase();
        let redirectTo = '/dashboard';

        if (role === 'super_admin') {
          redirectTo = '/super-admin/dashboard';
        } else if (role === 'admin' || role === 'receptionist') {
          redirectTo = '/admin-gym/dashboard';
        }

        console.log('🎯 Redirigiendo a:', redirectTo);

        return {
          success: true,
          redirectTo,
        };
      }

      console.log('❌ No hay token en la respuesta');

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Credenciales inválidas',
        },
      };
    } catch (error: any) {
      console.error('❌ Error en login:', error);
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
