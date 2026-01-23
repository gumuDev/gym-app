import { useState } from 'react';
import { useNavigation } from '@refinedev/core';
import { SuperAdminLayout } from '../../../components/layout/SuperAdminLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface CreateGymForm {
  name: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  address: string;
  admin_password: string;
}

export const GymsCreate = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateGymForm>({
    name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    admin_password: '',
  });

  const handleChange = (field: keyof CreateGymForm, value: string) => {
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
    if (!formData.admin_password.trim()) {
      newErrors.admin_password = 'La contraseña es requerida';
    } else if (formData.admin_password.length < 6) {
      newErrors.admin_password = 'La contraseña debe tener al menos 6 caracteres';
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

      // Transformar datos al formato que espera el backend
      const payload = {
        name: formData.name,
        email: formData.owner_email, // Email del gym
        phone: formData.phone,
        address: formData.address,
        adminName: formData.owner_name,
        adminEmail: formData.owner_email,
        adminPassword: formData.admin_password,
      };

      await axios.post(
        `${API_URL}/super-admin/gyms`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Gimnasio creado exitosamente');
      push('/super-admin/gyms');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear el gimnasio';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Crear Gimnasio</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Registra un nuevo gimnasio en el sistema
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
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

              <Input
                label="Contraseña Admin"
                type="password"
                value={formData.admin_password}
                onChange={(e) => handleChange('admin_password', e.target.value)}
                error={errors.admin_password}
                required
                placeholder="Mínimo 6 caracteres"
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
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                Crear Gimnasio
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push('/super-admin/gyms')}
                disabled={loading}
                className="w-full sm:w-auto"
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
