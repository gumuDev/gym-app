import { useState } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'receptionist' | 'trainer';
}

export const UsersCreate = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'receptionist',
  });

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

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      };

      await axios.post(`${API_URL}/users`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('✅ Usuario creado exitosamente');
      push('/admin-gym/users');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear usuario';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGymLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Nuevo Usuario
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                Crea un nuevo recepcionista o entrenador
              </p>
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
              {/* Nombre */}
              <Input
                label="Nombre Completo"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="Juan Pérez"
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                required
                placeholder="juan@gimnasio.com"
              />

              {/* Rol */}
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
                <p className="mt-1 text-xs text-gray-500">
                  {formData.role === 'receptionist'
                    ? 'Puede registrar asistencias, gestionar membresías y ver clientes'
                    : 'Puede ver clientes y asistencias (solo lectura)'}
                </p>
              </div>

              {/* Contraseña */}
              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                required
                placeholder="Mínimo 6 caracteres"
                helperText="La contraseña debe tener al menos 6 caracteres"
              />

              {/* Confirmar Contraseña */}
              <Input
                label="Confirmar Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                required
                placeholder="Repite la contraseña"
              />

              {/* Info Box */}
              <Card className="border-l-4 border-blue-500 bg-blue-50">
                <div className="flex items-start gap-2">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Información importante</p>
                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                      <li>El usuario recibirá sus credenciales por email</li>
                      <li>Puede cambiar su contraseña después del primer login</li>
                      <li>Los administradores tienen acceso completo al sistema</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-initial">
                  Crear Usuario
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
