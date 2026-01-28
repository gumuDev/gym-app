import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
import { SuperAdminLayout } from '../../../components/layout/SuperAdminLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showError, showSuccess } from '../../../utils/notification';
import axios from 'axios';

interface EditGymForm {
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  address: string;
  is_active: boolean;
}

export const GymsEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EditGymForm>({
    name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(
          `${API_URL}/super-admin/gyms/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const gym = response.data.data;
        setFormData({
          name: gym.name,
          owner_name: gym.owner_name,
          owner_email: gym.owner_email,
          phone: gym.phone,
          address: gym.address,
          is_active: gym.is_active,
        });
      } catch (error: any) {
        showError(error.response?.data?.message || 'Error al cargar gimnasio');
        push('/super-admin/gyms');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchGym();
  }, [id]);

  const handleChange = (field: keyof EditGymForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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
    }
    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'El nombre del propietario es requerido';
    }
    if (!formData.owner_email.trim()) {
      newErrors.owner_email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
      newErrors.owner_email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
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
      await axios.patch(
        `${API_URL}/super-admin/gyms/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showSuccess('Gimnasio actualizado exitosamente');
      push(`/super-admin/gyms/show/${id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar el gimnasio';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Editar Gimnasio</h1>
          <p className="text-gray-500 mt-2">
            Actualiza la información del gimnasio
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nombre del Gimnasio"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                  placeholder="Ej: Gym Olimpo"
                />
              </div>

              <Input
                label="Nombre del Propietario"
                type="text"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                error={errors.owner_name}
                required
                placeholder="Ej: Juan Pérez"
              />

              <Input
                label="Email del Propietario"
                type="email"
                value={formData.owner_email}
                onChange={(e) => handleChange('owner_email', e.target.value)}
                error={errors.owner_email}
                required
                placeholder="Ej: juan@gimnasio.com"
              />

              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                required
                placeholder="Ej: +1234567890"
              />

              <div className="md:col-span-2">
                <Input
                  label="Dirección"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  error={errors.address}
                  required
                  placeholder="Ej: Av. Principal 123, Ciudad"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Gimnasio Activo
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-8">
                  Los gimnasios inactivos no pueden acceder al sistema
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button type="submit" loading={loading}>
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push(`/super-admin/gyms/show/${id}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};
