import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { useParams } from 'react-router-dom';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'RECEPTIONIST' | 'TRAINER';
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'receptionist' | 'trainer';
}

export const UsersEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'receptionist',
  });

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data;
      setUser(userData);

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        role: userData.role.toLowerCase() as 'receptionist' | 'trainer',
      });
    } catch (error: any) {
      alert('Error al cargar el usuario');
      push('/admin-gym/users');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña solo si se ingresó
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      // Solo incluir password si se ingresó
      if (formData.password) {
        payload.password = formData.password;
      }

      await axios.patch(`${API_URL}/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Usuario actualizado exitosamente');
      push('/admin-gym/users');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar usuario';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminGymLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </AdminGymLayout>
    );
  }

  if (!user) {
    return (
      <AdminGymLayout>
        <Card>
          <p className="text-gray-500">Usuario no encontrado</p>
        </Card>
      </AdminGymLayout>
    );
  }

  return (
    <AdminGymLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Editar Usuario</h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">{user.name}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => push('/admin-gym/users')}
              className="hidden lg:inline-flex"
            >
              ← Volver
            </Button>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 lg:space-y-6">
              <Input
                label="Nombre Completo"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    handleChange('role', e.target.value as 'receptionist' | 'trainer')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="receptionist">Recepcionista</option>
                  <option value="trainer">Entrenador</option>
                </select>
              </div>

              <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔒</span>
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">Cambiar Contraseña (Opcional)</p>
                    <p className="text-yellow-800">
                      Deja los campos vacíos si no deseas cambiar la contraseña
                    </p>
                  </div>
                </div>
              </Card>

              <Input
                label="Nueva Contraseña (Opcional)"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="Dejar vacío para mantener actual"
              />

              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Repetir nueva contraseña"
              />

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-initial">
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => push('/admin-gym/users')}
                  disabled={loading}
                  className="flex-1 sm:flex-initial"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </AdminGymLayout>
  );
};
