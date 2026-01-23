import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface PricingPlan {
  id: string;
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
  discipline: {
    id: string;
    name: string;
  };
}

export const PricingEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/pricing`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend devuelve { success, data }
        const plans = response.data.data || [];

        // Buscar el plan por id
        const foundPlan = plans.find((p: PricingPlan) => p.id === id);

        if (!foundPlan) {
          alert('Plan no encontrado');
          push('/admin-gym/pricing');
          return;
        }

        setPlan(foundPlan);
        setPrice(foundPlan.price.toString());
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cargar plan');
        push('/admin-gym/pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, push]);

  const validateForm = (): boolean => {
    const priceValue = parseFloat(price);
    if (!price || priceValue <= 0) {
      setError('Ingresa un precio válido mayor a 0');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      await axios.patch(
        `${API_URL}/pricing/${id}`,
        { price: parseFloat(price) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Plan actualizado exitosamente');
      push('/admin-gym/pricing');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar el plan';
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

  if (!plan) {
    return null;
  }

  return (
    <AdminGymLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Editar Plan de Precios
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Actualiza el precio del plan
          </p>
        </div>

        <Card>
          {/* Información del plan (no editable) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalles del Plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Disciplina:</span>
                <span className="font-medium text-gray-800">{plan.discipline.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-800">
                  {plan.num_people === 1 ? 'Individual' : `${plan.num_people} Personas`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duración:</span>
                <span className="font-medium text-gray-800">
                  {plan.num_months} {plan.num_months === 1 ? 'mes' : 'meses'}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              * Solo puedes modificar el precio. Para cambiar otros parámetros, crea un nuevo plan.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 lg:space-y-6">
              {/* Precio actual */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Precio Actual:</span> Bs {plan.price.toFixed(2)}
                </p>
              </div>

              {/* Nuevo precio */}
              <Input
                label="Nuevo Precio (Bs)"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                required
                min="0.01"
                step="0.01"
                placeholder="Ej: 200.00"
                helperText="Ingresa el nuevo precio total del plan"
              />

              {/* Vista previa del cambio */}
              {price && parseFloat(price) !== plan.price && parseFloat(price) > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Vista previa:</p>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>
                      <span className="font-semibold">Precio anterior:</span> Bs{' '}
                      {plan.price.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Precio nuevo:</span> Bs{' '}
                      {parseFloat(price).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Diferencia:</span>{' '}
                      {parseFloat(price) > plan.price ? '+' : ''}
                      Bs {(parseFloat(price) - plan.price).toFixed(2)}
                    </p>
                    {plan.num_months > 1 && (
                      <p className="mt-2 text-xs">
                        Precio por mes: Bs {(parseFloat(price) / plan.num_months).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
              <Button type="submit" loading={saving} className="w-full sm:w-auto">
                Guardar Cambios
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push('/admin-gym/pricing')}
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
