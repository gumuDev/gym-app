import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { useParams } from 'react-router-dom';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Member {
  id: string;
  code: string;
  name: string;
}

interface Discipline {
  id: string;
  name: string;
}

interface Membership {
  id: string;
  member: Member;
  discipline: Discipline;
  status: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
}

interface PricingPlan {
  id: string;
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
}

interface RenewForm {
  num_months: string;
  amount_paid: string;
  payment_method: string;
  notes: string;
}

export const MembershipsRenew = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<RenewForm>({
    num_months: '1',
    amount_paid: '',
    payment_method: 'efectivo',
    notes: '',
  });

  useEffect(() => {
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembership = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Fetch membership and pricing plans in parallel
      const [membershipRes, pricingRes] = await Promise.all([
        axios.get(`${API_URL}/memberships`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/pricing`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const memberships = membershipRes.data.data || [];
      const foundMembership = memberships.find((m: Membership) => m.id === id);

      if (!foundMembership) {
        alert('Membresía no encontrada');
        push('/admin-gym/memberships');
        return;
      }

      setMembership(foundMembership);

      const plans = pricingRes.data.data || [];
      setPricingPlans(plans);

      // Set default values from pricing plans
      const disciplinePlans = plans.filter(
        (p: PricingPlan) => p.discipline_id === foundMembership.discipline.id
      );

      if (disciplinePlans.length > 0) {
        // Default to 1-month plan if available
        const defaultPlan = disciplinePlans.find((p: PricingPlan) => p.num_months === 1);
        if (defaultPlan) {
          setFormData((prev) => ({
            ...prev,
            num_months: defaultPlan.num_months.toString(),
            amount_paid: defaultPlan.price.toString(),
          }));
        }
      }
    } catch (error: any) {
      alert('Error al cargar la membresía');
      push('/admin-gym/memberships');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof RenewForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = pricingPlans.find((p) => p.id === planId);
    if (plan) {
      setFormData((prev) => ({
        ...prev,
        num_months: plan.num_months.toString(),
        amount_paid: plan.price.toString(),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numMonths = parseInt(formData.num_months);
    if (!formData.num_months || numMonths < 1) {
      newErrors.num_months = 'Ingresa un número de meses válido';
    }

    const amountPaid = parseFloat(formData.amount_paid);
    if (!formData.amount_paid || amountPaid <= 0) {
      newErrors.amount_paid = 'Ingresa un monto válido mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEndDate = (startDate: Date, months: number): string => {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const payload = {
        num_months: parseInt(formData.num_months),
        amount_paid: parseFloat(formData.amount_paid),
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      };

      await axios.post(`${API_URL}/memberships/${id}/renew`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Membresía renovada exitosamente');
      push('/admin-gym/memberships');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al renovar la membresía';
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

  if (!membership) {
    return (
      <AdminGymLayout>
        <Card>
          <p className="text-gray-500">Membresía no encontrada</p>
        </Card>
      </AdminGymLayout>
    );
  }

  const disciplinePlans = pricingPlans.filter(
    (p) => p.discipline_id === membership.discipline.id
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AdminGymLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Renovar Membresía
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Renueva la membresía de {membership.member.name}
          </p>
        </div>

        {/* Información de la membresía actual */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Membresía Actual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Cliente:</p>
              <p className="font-medium text-gray-900">
                {membership.member.name} ({membership.member.code})
              </p>
            </div>
            <div>
              <p className="text-gray-500">Disciplina:</p>
              <p className="font-medium text-gray-900">{membership.discipline.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de Inicio:</p>
              <p className="font-medium text-gray-900">
                {formatDate(membership.start_date)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de Vencimiento:</p>
              <p className="font-medium text-gray-900">
                {formatDate(membership.end_date)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Último Pago:</p>
              <p className="font-medium text-gray-900">
                Bs {membership.amount_paid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Estado:</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  membership.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {membership.status === 'ACTIVE' ? 'Activa' : 'Vencida'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Nueva Membresía
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 lg:space-y-6">
              {/* Planes Sugeridos */}
              {disciplinePlans.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Planes Disponibles
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {disciplinePlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanSelect(plan.id)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <p className="font-medium text-gray-900">
                          {plan.num_months} {plan.num_months === 1 ? 'Mes' : 'Meses'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {plan.num_people === 1 ? 'Individual' : `${plan.num_people} Personas`}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          Bs {plan.price.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Haz clic en un plan para seleccionarlo
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duración */}
                <Input
                  label="Duración (meses)"
                  type="number"
                  value={formData.num_months}
                  onChange={(e) => handleChange('num_months', e.target.value)}
                  error={errors.num_months}
                  required
                  min="1"
                  helperText="Puedes modificar la duración manualmente"
                />

                {/* Monto */}
                <Input
                  label="Monto a Pagar (Bs)"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => handleChange('amount_paid', e.target.value)}
                  error={errors.amount_paid}
                  required
                  min="0.01"
                  step="0.01"
                  helperText="Puedes modificar el monto manualmente"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => handleChange('payment_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="pago_movil">Pago Móvil</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* Resumen */}
              {formData.num_months && formData.amount_paid && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Resumen de la renovación:
                  </p>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <span className="font-semibold">Duración:</span> {formData.num_months}{' '}
                      {parseInt(formData.num_months) === 1 ? 'mes' : 'meses'}
                    </p>
                    <p>
                      <span className="font-semibold">Nueva Fecha de Inicio:</span> Hoy (
                      {new Date().toLocaleDateString('es-ES')})
                    </p>
                    <p>
                      <span className="font-semibold">Nueva Fecha de Vencimiento:</span>{' '}
                      {new Date(
                        calculateEndDate(new Date(), parseInt(formData.num_months))
                      ).toLocaleDateString('es-ES')}
                    </p>
                    <p className="pt-2 border-t border-green-300">
                      <span className="font-semibold">Total a Pagar:</span> Bs{' '}
                      {parseFloat(formData.amount_paid).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                Renovar Membresía
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => push('/admin-gym/memberships')}
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
