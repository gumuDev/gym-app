import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface EditDisciplineForm {
  name: string;
  description: string;
}

export const DisciplinesEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EditDisciplineForm>({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/disciplines`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Buscar la disciplina por id
        const discipline = response.data.data.find((d: any) => d.id === id);

        if (!discipline) {
          alert('Disciplina no encontrada');
          push('/admin-gym/disciplines');
          return;
        }

        setFormData({
          name: discipline.name || '',
          description: discipline.description || '',
        });
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cargar disciplina');
        push('/admin-gym/disciplines');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscipline();
  }, [id, push]);

  const handleChange = (field: keyof EditDisciplineForm, value: string) => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const payload: any = {
        name: formData.name,
      };

      if (formData.description) {
        payload.description = formData.description;
      }

      await axios.patch(
        `${API_URL}/disciplines/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Disciplina actualizada exitosamente');
      push('/admin-gym/disciplines');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar la disciplina';
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Editar Disciplina</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Actualiza la información de la disciplina
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 lg:space-y-6">
              {/* Nombre - Campo requerido */}
              <Input
                label="Nombre de la Disciplina"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="Ej: CrossFit, Yoga, Musculación, Boxeo"
              />

              {/* Descripción - Opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe brevemente esta disciplina y qué incluye..."
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
                onClick={() => push('/admin-gym/disciplines')}
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
