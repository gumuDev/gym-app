import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface EditMemberForm {
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  address: string;
  emergency_contact: string;
}

export const MembersEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EditMemberForm>({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    emergency_contact: '',
  });

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/members/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const member = response.data.data;
        setFormData({
          name: member.name || '',
          email: member.email || '',
          phone: member.phone || '',
          birth_date: member.birth_date
            ? new Date(member.birth_date).toISOString().split('T')[0]
            : '',
          address: member.address || '',
          emergency_contact: member.emergency_contact || '',
        });
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cargar miembro');
        push('/admin-gym/members');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, push]);

  const handleChange = (field: keyof EditMemberForm, value: string) => {
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

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Preparar payload
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
      };

      // Campos opcionales
      if (formData.email) payload.email = formData.email;
      if (formData.birth_date) payload.birth_date = formData.birth_date;
      if (formData.address) payload.address = formData.address;
      if (formData.emergency_contact) payload.emergency_contact = formData.emergency_contact;

      await axios.patch(
        `${API_URL}/members/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Miembro actualizado exitosamente');
      push('/admin-gym/members');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar el miembro';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminGymLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </AdminGymLayout>
    );
  }

  return (
    <AdminGymLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Editar Miembro</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Actualiza la información del miembro
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Nombre - Campo requerido */}
              <div className="md:col-span-2">
                <Input
                  label="Nombre Completo"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              {/* Email - Opcional */}
              <Input
                label="Email (Opcional)"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="Ej: juan@email.com"
              />

              {/* Teléfono - Requerido */}
              <Input
                label="Teléfono"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                required
                placeholder="Ej: +58 412 1234567"
              />

              {/* Fecha de nacimiento - Opcional */}
              <Input
                label="Fecha de Nacimiento (Opcional)"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                error={errors.birth_date}
              />

              {/* Contacto de emergencia - Opcional */}
              <Input
                label="Contacto de Emergencia (Opcional)"
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => handleChange('emergency_contact', e.target.value)}
                error={errors.emergency_contact}
                placeholder="Ej: María Pérez - +58 412 9876543"
              />

              {/* Dirección - Opcional */}
              <div className="md:col-span-2">
                <Input
                  label="Dirección (Opcional)"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  error={errors.address}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                />
              </div>
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
              <Button type="submit" loading={saving} className="w-full sm:w-auto">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push('/admin-gym/members')}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminGymLayout>
  );
};
