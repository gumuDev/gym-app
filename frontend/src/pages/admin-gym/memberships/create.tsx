import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
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
  is_active: boolean;
}

interface Discipline {
  id: string;
  name: string;
  is_active: boolean;
}

interface PricingPlan {
  id: string;
  discipline_id: string;
  num_people: number;
  num_months: number;
  price: number;
}

interface NewMemberForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CreateMembershipForm {
  member_id: string;
  discipline_id: string;
  pricing_plan_id: string;
  num_months: string;
  amount_paid: string;
  payment_method: 'qr' | 'efectivo';
  notes: string;
}

type Step = 'select-type' | 'create-member' | 'select-member' | 'select-plan' | 'payment';

export const MembershipsCreate = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('select-type');
  const [isNewMember, setIsNewMember] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PricingPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newMemberData, setNewMemberData] = useState<NewMemberForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [formData, setFormData] = useState<CreateMembershipForm>({
    member_id: '',
    discipline_id: '',
    pricing_plan_id: '',
    num_months: '1',
    amount_paid: '',
    payment_method: 'efectivo',
    notes: '',
  });

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.discipline_id) {
      const filtered = pricingPlans.filter(
        (plan) => plan.discipline_id === formData.discipline_id
      );
      setFilteredPlans(filtered);

      if (formData.pricing_plan_id) {
        const currentPlan = pricingPlans.find((p) => p.id === formData.pricing_plan_id);
        if (currentPlan && currentPlan.discipline_id !== formData.discipline_id) {
          setFormData((prev) => ({ ...prev, pricing_plan_id: '', amount_paid: '' }));
        }
      }
    } else {
      setFilteredPlans([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.discipline_id]);

  useEffect(() => {
    if (formData.pricing_plan_id) {
      const selectedPlan = pricingPlans.find((p) => p.id === formData.pricing_plan_id);
      if (selectedPlan) {
        setFormData((prev) => ({
          ...prev,
          num_months: selectedPlan.num_months.toString(),
          amount_paid: selectedPlan.price.toString(),
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pricing_plan_id]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const [membersRes, disciplinesRes, pricingRes] = await Promise.all([
        axios.get(`${API_URL}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/disciplines`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/pricing`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allMembers = membersRes.data.data || [];
      const activeMembers = allMembers.filter((m: Member) => m.is_active);
      setMembers(activeMembers);

      const allDisciplines = disciplinesRes.data.data || [];
      const activeDisciplines = allDisciplines.filter((d: Discipline) => d.is_active);
      setDisciplines(activeDisciplines);

      const plans = pricingRes.data.data || [];
      setPricingPlans(plans);

      if (activeDisciplines.length === 0) {
        alert('No hay disciplinas activas. Por favor, crea una disciplina primero.');
        push('/admin-gym/disciplines');
        return;
      }

      if (plans.length === 0) {
        alert('No hay planes de precios. Por favor, crea un plan primero.');
        push('/admin-gym/pricing');
        return;
      }
    } catch (err: any) {
      alert('Error al cargar datos');
      push('/admin-gym/memberships');
    } finally {
      setLoadingData(false);
    }
  };

  const handleMemberTypeSelection = (isNew: boolean) => {
    setIsNewMember(isNew);
    setCurrentStep(isNew ? 'create-member' : 'select-member');
  };

  const handleNewMemberChange = (field: keyof NewMemberForm, value: string) => {
    setNewMemberData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (field: keyof CreateMembershipForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateNewMember = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newMemberData.name || newMemberData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!newMemberData.phone || newMemberData.phone.trim().length < 7) {
      newErrors.phone = 'Ingresa un teléfono válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMember = async () => {
    if (!validateNewMember()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const payload = {
        name: newMemberData.name.trim(),
        phone: newMemberData.phone.trim(),
        email: newMemberData.email.trim() || undefined,
        address: newMemberData.address.trim() || undefined,
      };

      const response = await axios.post(`${API_URL}/members`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMember = response.data.data;

      // Add new member to list
      setMembers((prev) => [newMember, ...prev]);

      // Select the new member
      setFormData((prev) => ({ ...prev, member_id: newMember.id }));

      // Move to plan selection
      setCurrentStep('select-plan');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el miembro';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelection = (memberId: string) => {
    setFormData((prev) => ({ ...prev, member_id: memberId }));
    setCurrentStep('select-plan');
  };

  const validateMembership = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.member_id) {
      newErrors.member_id = 'Debes seleccionar un cliente';
    }

    if (!formData.discipline_id) {
      newErrors.discipline_id = 'Debes seleccionar una disciplina';
    }

    if (!formData.pricing_plan_id) {
      newErrors.pricing_plan_id = 'Debes seleccionar un plan';
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

  const handleSubmit = async () => {
    if (!validateMembership()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const startDate = new Date();
      const endDate = calculateEndDate(startDate, parseInt(formData.num_months));

      const payload = {
        member_id: formData.member_id,
        discipline_id: formData.discipline_id,
        start_date: startDate.toISOString(),
        end_date: endDate,
        amount_paid: parseFloat(formData.amount_paid),
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
      };

      await axios.post(`${API_URL}/memberships`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Membresía creada exitosamente');
      push('/admin-gym/memberships');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear la membresía';
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

  const selectedMember = members.find((m) => m.id === formData.member_id);
  const selectedDiscipline = disciplines.find((d) => d.id === formData.discipline_id);
  const selectedPlan = pricingPlans.find((p) => p.id === formData.pricing_plan_id);

  return (
    <AdminGymLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Nueva Membresía
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Registra una nueva membresía paso a paso
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'select-type' || currentStep === 'create-member' || currentStep === 'select-member'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'select-plan' || currentStep === 'payment'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <span className="text-xs mt-2 text-center">Cliente</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full ${
                  currentStep === 'select-plan' || currentStep === 'payment' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'select-plan'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'payment'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="text-xs mt-2 text-center">Plan</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div
                className={`h-full ${
                  currentStep === 'payment' ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'payment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <span className="text-xs mt-2 text-center">Pago</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Member Type */}
        {currentStep === 'select-type' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              ¿El cliente es nuevo o ya existe?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleMemberTypeSelection(true)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="text-4xl mb-3">👤➕</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cliente Nuevo</h3>
                <p className="text-sm text-gray-600">
                  Crear un nuevo cliente y asignarle una membresía
                </p>
              </button>

              <button
                onClick={() => handleMemberTypeSelection(false)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cliente Existente</h3>
                <p className="text-sm text-gray-600">
                  Seleccionar un cliente de la lista y crear su membresía
                </p>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={() => push('/admin-gym/memberships')}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2a: Create New Member */}
        {currentStep === 'create-member' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Datos del Nuevo Cliente
            </h2>
            <div className="space-y-4">
              <Input
                label="Nombre Completo"
                value={newMemberData.name}
                onChange={(e) => handleNewMemberChange('name', e.target.value)}
                error={errors.name}
                required
                placeholder="Ej: Juan Pérez"
              />

              <Input
                label="Teléfono"
                type="tel"
                value={newMemberData.phone}
                onChange={(e) => handleNewMemberChange('phone', e.target.value)}
                error={errors.phone}
                required
                placeholder="Ej: +58 424 1234567"
              />

              <Input
                label="Email (Opcional)"
                type="email"
                value={newMemberData.email}
                onChange={(e) => handleNewMemberChange('email', e.target.value)}
                placeholder="Ej: juan@email.com"
              />

              <Input
                label="Dirección (Opcional)"
                value={newMemberData.address}
                onChange={(e) => handleNewMemberChange('address', e.target.value)}
                placeholder="Ej: Av. Principal #123"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={createMember} loading={loading} className="flex-1">
                Continuar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentStep('select-type')}
                disabled={loading}
              >
                Atrás
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2b: Select Existing Member */}
        {currentStep === 'select-member' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Selecciona el Cliente
            </h2>

            {members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay clientes registrados</p>
                <Button onClick={() => setCurrentStep('create-member')}>
                  Crear Nuevo Cliente
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberSelection(member.id)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.code}</p>
                        </div>
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentStep('select-type')}
                  >
                    Atrás
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Step 3: Select Plan */}
        {currentStep === 'select-plan' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Selecciona Disciplina y Plan
            </h2>

            <div className="space-y-6">
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

              {/* Planes */}
              {formData.discipline_id && filteredPlans.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Plan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handleChange('pricing_plan_id', plan.id)}
                        className={`p-4 border-2 rounded-lg transition-all text-left ${
                          formData.pricing_plan_id === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
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
                  {errors.pricing_plan_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.pricing_plan_id}</p>
                  )}
                </div>
              )}

              {formData.discipline_id && filteredPlans.length === 0 && (
                <p className="text-sm text-gray-500">
                  No hay planes disponibles para esta disciplina
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setCurrentStep('payment')}
                disabled={!formData.pricing_plan_id}
                className="flex-1"
              >
                Continuar
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setCurrentStep(isNewMember ? 'create-member' : 'select-member')
                }
              >
                Atrás
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Payment */}
        {currentStep === 'payment' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Método de Pago
            </h2>

            <div className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona el método de pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('payment_method', 'qr')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      formData.payment_method === 'qr'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">📱</div>
                    <h3 className="font-semibold text-gray-900">Pago QR</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pago móvil, transferencia o QR
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('payment_method', 'efectivo')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      formData.payment_method === 'efectivo'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">💵</div>
                    <h3 className="font-semibold text-gray-900">Efectivo</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pago en efectivo o punto de venta
                    </p>
                  </button>
                </div>
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

              {/* Resumen Final */}
              {selectedMember && selectedDiscipline && selectedPlan && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-3">
                    Resumen de la membresía:
                  </p>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <span className="font-semibold">Cliente:</span> {selectedMember.name} (
                      {selectedMember.code})
                    </p>
                    <p>
                      <span className="font-semibold">Disciplina:</span> {selectedDiscipline.name}
                    </p>
                    <p>
                      <span className="font-semibold">Plan:</span>{' '}
                      {selectedPlan.num_people === 1
                        ? 'Individual'
                        : `${selectedPlan.num_people} Personas`}{' '}
                      - {formData.num_months}{' '}
                      {parseInt(formData.num_months) === 1 ? 'mes' : 'meses'}
                    </p>
                    <p>
                      <span className="font-semibold">Método de Pago:</span>{' '}
                      {formData.payment_method === 'qr' ? 'Pago QR' : 'Efectivo'}
                    </p>
                    <p>
                      <span className="font-semibold">Inicio:</span> Hoy (
                      {new Date().toLocaleDateString('es-ES')})
                    </p>
                    <p>
                      <span className="font-semibold">Vencimiento:</span>{' '}
                      {new Date(
                        calculateEndDate(new Date(), parseInt(formData.num_months))
                      ).toLocaleDateString('es-ES')}
                    </p>
                    <p className="pt-2 border-t border-green-300 text-base">
                      <span className="font-semibold">Total:</span> Bs {formData.amount_paid}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSubmit} loading={loading} className="flex-1">
                Crear Membresía
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentStep('select-plan')}
                disabled={loading}
              >
                Atrás
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminGymLayout>
  );
};
