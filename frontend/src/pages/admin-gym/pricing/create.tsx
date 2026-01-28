import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showError, showSuccess } from '../../../utils/notification';
import axios from 'axios';

interface CreatePricingForm {
  discipline_id: string;
  num_people: string;
  num_months: string;
  price: string;
}

interface Discipline {
  id: string;
  name: string;
  is_active: boolean;
}

export const PricingCreate = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingDisciplines, setLoadingDisciplines] = useState(true);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreatePricingForm>({
    discipline_id: '',
    num_people: '1',
    num_months: '1',
    price: '',
  });

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/disciplines`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend devuelve { success, data }
        const allDisciplines = response.data.data || [];

        // Filtrar solo disciplinas activas
        const activeDisciplines = allDisciplines.filter((d: Discipline) => d.is_active);
        setDisciplines(activeDisciplines);

        if (activeDisciplines.length === 0) {
          showError('No hay disciplinas activas. Por favor, crea una disciplina primero.');
          push('/admin-gym/disciplines');
        }
      } catch (err: any) {
        showError('Error al cargar disciplinas');
        push('/admin-gym/pricing');
      } finally {
        setLoadingDisciplines(false);
      }
    };

    fetchDisciplines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: keyof CreatePricingForm, value: string) => {
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

    if (!formData.discipline_id) {
      newErrors.discipline_id = 'Debes seleccionar una disciplina';
    }

    const numPeople = parseInt(formData.num_people);
    if (!formData.num_people || numPeople < 1 || numPeople > 50) {
      newErrors.num_people = 'Ingresa un número válido entre 1 y 50';
    }

    const numMonths = parseInt(formData.num_months);
    if (!formData.num_months || numMonths < 1 || numMonths > 24) {
      newErrors.num_months = 'Ingresa un número válido entre 1 y 24';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || price <= 0) {
      newErrors.price = 'Ingresa un precio válido mayor a 0';
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
        discipline_id: formData.discipline_id,
        num_people: parseInt(formData.num_people),
        num_months: parseInt(formData.num_months),
        price: parseFloat(formData.price),
      };

      await axios.post(`${API_URL}/pricing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess('Plan de precios creado exitosamente');
      push('/admin-gym/pricing');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear el plan de precios';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDisciplines) {
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Crear Plan de Precios
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Define los precios para diferentes tipos de membresías
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 lg:space-y-6">
              {/* Disciplina */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplina <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discipline_id}
                  onChange={(e) => handleChange('discipline_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.discipline_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una disciplina</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
                {errors.discipline_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.discipline_id}</p>
                )}
              </div>

              {/* Número de personas */}
              <Input
                label="Número de Personas"
                type="number"
                value={formData.num_people}
                onChange={(e) => handleChange('num_people', e.target.value)}
                error={errors.num_people}
                required
                min="1"
                max="50"
                placeholder="Ej: 1 (individual), 2, 3..."
                helperText="1 = Individual, 2+ = Grupal"
              />

              {/* Duración en meses */}
              <Input
                label="Duración en Meses"
                type="number"
                value={formData.num_months}
                onChange={(e) => handleChange('num_months', e.target.value)}
                error={errors.num_months}
                required
                min="1"
                max="24"
                placeholder="Ej: 1, 3, 6, 12"
                helperText="Número de meses que dura la membresía"
              />

              {/* Precio */}
              <Input
                label="Precio (Bs)"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                error={errors.price}
                required
                min="0.01"
                step="0.01"
                placeholder="Ej: 150.00"
                helperText="Precio total del plan en Bolívares"
              />

              {/* Resumen del plan */}
              {formData.discipline_id && formData.num_people && formData.num_months && formData.price && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Vista previa del plan:</p>
                  <div className="text-sm text-blue-700">
                    <p>
                      <span className="font-semibold">Disciplina:</span>{' '}
                      {disciplines.find((d) => d.id === formData.discipline_id)?.name}
                    </p>
                    <p>
                      <span className="font-semibold">Tipo:</span>{' '}
                      {formData.num_people === '1'
                        ? 'Individual'
                        : `${formData.num_people} Personas`}
                    </p>
                    <p>
                      <span className="font-semibold">Duración:</span>{' '}
                      {formData.num_months} {formData.num_months === '1' ? 'mes' : 'meses'}
                    </p>
                    <p>
                      <span className="font-semibold">Precio Total:</span> Bs {formData.price}
                    </p>
                    {parseInt(formData.num_months) > 1 && (
                      <p className="mt-1 text-xs">
                        (Bs {(parseFloat(formData.price) / parseInt(formData.num_months)).toFixed(2)}{' '}
                        por mes)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                Crear Plan
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push('/admin-gym/pricing')}
                disabled={loading}
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
