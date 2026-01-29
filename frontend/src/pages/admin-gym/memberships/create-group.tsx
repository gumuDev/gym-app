import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { API_URL, TOKEN_KEY } from '../../../constants/auth';
import { showError, showSuccess } from '../../../utils/notification';
import axios from 'axios';
import type {
  Member,
  Discipline,
  PricingPlan,
  MemberSelectionItem,
  MemberInput,
} from '../../../types/membership';
import { createGroupMembership, calculateEndDate } from '../../../services/membershipService';

type Step = 'select-discipline' | 'select-plan' | 'select-members' | 'confirm';

interface NewMemberForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export const MembershipsCreateGroup = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>('select-discipline');

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PricingPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<MemberSelectionItem[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [filteredMemberList, setFilteredMemberList] = useState<Member[]>([]);

  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'efectivo'>('efectivo');
  const [notes, setNotes] = useState('');

  // Estado para crear nuevo miembro
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [newMemberData, setNewMemberData] = useState<NewMemberForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [newMemberErrors, setNewMemberErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDisciplineId) {
      // Filtrar solo planes GRUPALES (num_people > 1) para membresía grupal
      const filtered = pricingPlans.filter(
        (plan) => plan.discipline_id === selectedDisciplineId && plan.num_people > 1
      );
      setFilteredPlans(filtered);
    } else {
      setFilteredPlans([]);
    }
  }, [selectedDisciplineId, pricingPlans]);

  useEffect(() => {
    if (memberSearch.trim()) {
      const search = memberSearch.toLowerCase();
      const filtered = members.filter(
        (m) =>
          !selectedMembers.some((sm) => sm.id === m.id) &&
          (m.name.toLowerCase().includes(search) ||
            m.code.toLowerCase().includes(search) ||
            (m.phone && m.phone.toLowerCase().includes(search)))
      );
      setFilteredMemberList(filtered);
    } else {
      const filtered = members.filter((m) => !selectedMembers.some((sm) => sm.id === m.id));
      setFilteredMemberList(filtered);
    }
  }, [memberSearch, members, selectedMembers]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const [disciplinesRes, pricingRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/disciplines`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/pricing`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/members?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allDisciplines = disciplinesRes.data.data || [];
      const activeDisciplines = allDisciplines.filter((d: Discipline) => d.is_active);
      setDisciplines(activeDisciplines);

      const plans = pricingRes.data.data || [];
      setPricingPlans(plans);

      const allMembers = membersRes.data.data?.data || membersRes.data.data || [];
      const activeMembers = allMembers.filter((m: Member) => m.is_active);
      setMembers(activeMembers);
      setFilteredMemberList(activeMembers);

      if (activeDisciplines.length === 0) {
        showError('No hay disciplinas activas. Por favor, crea una disciplina primero.');
        push('/admin-gym/disciplines');
        return;
      }

      if (plans.length === 0) {
        showError('No hay planes de precios. Por favor, crea un plan primero.');
        push('/admin-gym/pricing');
        return;
      }
    } catch (err: any) {
      showError('Error al cargar datos');
      push('/admin-gym/memberships');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDisciplineSelect = (disciplineId: string) => {
    setSelectedDisciplineId(disciplineId);
    setSelectedPlanId('');
    setCurrentStep('select-plan');
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentStep('select-members');
  };

  const handleAddMember = (member: Member) => {
    const newMember: MemberSelectionItem = {
      ...member,
      selected: true,
      isPrimary: selectedMembers.length === 0, // Primer miembro es titular
    };
    setSelectedMembers([...selectedMembers, newMember]);
    setMemberSearch('');
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = selectedMembers.filter((m) => m.id !== memberId);

    // Si eliminamos al titular y quedan miembros, hacer titular al siguiente
    if (updatedMembers.length > 0) {
      const hadPrimary = selectedMembers.some((m) => m.id === memberId && m.isPrimary);
      if (hadPrimary) {
        updatedMembers[0].isPrimary = true;
      }
    }

    setSelectedMembers(updatedMembers);
  };

  const handleSetPrimary = (memberId: string) => {
    const updatedMembers = selectedMembers.map((m) => ({
      ...m,
      isPrimary: m.id === memberId,
    }));
    setSelectedMembers(updatedMembers);
  };

  const handleOpenNewMemberModal = () => {
    setShowNewMemberModal(true);
    setNewMemberData({ name: '', phone: '', email: '', address: '' });
    setNewMemberErrors({});
  };

  const handleCloseNewMemberModal = () => {
    setShowNewMemberModal(false);
    setNewMemberData({ name: '', phone: '', email: '', address: '' });
    setNewMemberErrors({});
  };

  const handleNewMemberChange = (field: keyof NewMemberForm, value: string) => {
    setNewMemberData((prev) => ({ ...prev, [field]: value }));
    if (newMemberErrors[field]) {
      setNewMemberErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateNewMember = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newMemberData.name || newMemberData.name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!newMemberData.phone || newMemberData.phone.trim().length < 7) {
      errors.phone = 'Ingresa un teléfono válido';
    }

    setNewMemberErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewMember = async () => {
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

      // Agregar a la lista de miembros
      setMembers((prev) => [newMember, ...prev]);

      // Agregar automáticamente a miembros seleccionados
      handleAddMember(newMember);

      // Cerrar modal
      handleCloseNewMemberModal();

      showSuccess(`Cliente ${newMember.name} creado y agregado`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el miembro';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToConfirm = () => {
    const selectedPlan = pricingPlans.find((p) => p.id === selectedPlanId);

    if (!selectedPlan) {
      showError('Selecciona un plan');
      return;
    }

    if (selectedMembers.length !== selectedPlan.num_people) {
      showError(`Debes seleccionar exactamente ${selectedPlan.num_people} miembro(s)`);
      return;
    }

    setCurrentStep('confirm');
  };

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      showError('Debes seleccionar al menos un miembro');
      return;
    }

    if (!selectedDisciplineId || !selectedPlanId) {
      showError('Debes seleccionar disciplina y plan');
      return;
    }

    setLoading(true);

    try {
      const members: MemberInput[] = selectedMembers.map((m) => ({
        memberId: m.id,
        isPrimary: m.isPrimary,
      }));

      await createGroupMembership({
        disciplineId: selectedDisciplineId,
        pricingPlanId: selectedPlanId,
        members,
        paymentMethod,
        notes: notes || undefined,
      });

      showSuccess('Membresía grupal creada exitosamente');
      push('/admin-gym/memberships');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la membresía grupal';
      showError(errorMessage);
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

  const selectedDiscipline = disciplines.find((d) => d.id === selectedDisciplineId);
  const selectedPlan = pricingPlans.find((p) => p.id === selectedPlanId);

  return (
    <AdminGymLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Nueva Membresía Grupal
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-2">
            Crea una membresía para múltiples personas
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {['Disciplina', 'Plan', 'Miembros', 'Confirmar'].map((label, index) => (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === 'select-discipline' && index === 0
                        ? 'bg-blue-600 text-white'
                        : currentStep === 'select-plan' && index === 1
                        ? 'bg-blue-600 text-white'
                        : currentStep === 'select-members' && index === 2
                        ? 'bg-blue-600 text-white'
                        : currentStep === 'confirm' && index === 3
                        ? 'bg-blue-600 text-white'
                        : index <
                          ['select-discipline', 'select-plan', 'select-members', 'confirm'].indexOf(
                            currentStep
                          )
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center">{label}</span>
                </div>
                {index < 3 && (
                  <div className="flex-1 h-1 bg-gray-300 mx-2">
                    <div
                      className={`h-full ${
                        index <
                        ['select-discipline', 'select-plan', 'select-members', 'confirm'].indexOf(
                          currentStep
                        )
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Discipline */}
        {currentStep === 'select-discipline' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Selecciona la Disciplina</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplines.map((discipline) => (
                <button
                  key={discipline.id}
                  onClick={() => handleDisciplineSelect(discipline.id)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{discipline.name}</h3>
                  {discipline.description && (
                    <p className="text-sm text-gray-600">{discipline.description}</p>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="secondary" onClick={() => push('/admin-gym/memberships')}>
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Select Plan */}
        {currentStep === 'select-plan' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Selecciona el Plan
              {selectedDiscipline && (
                <span className="text-base font-normal text-gray-500 ml-2">
                  ({selectedDiscipline.name})
                </span>
              )}
            </h2>

            {filteredPlans.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  No hay planes grupales disponibles para esta disciplina
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Por favor, crea un plan grupal (2 o más personas) en la sección de Precios
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`p-6 border-2 rounded-lg transition-all text-left ${
                      selectedPlanId === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {plan.num_months} {plan.num_months === 1 ? 'Mes' : 'Meses'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {plan.num_people === 1 ? 'Individual' : `${plan.num_people} Personas`}
                    </p>
                    <p className="text-xl font-bold text-blue-600">Bs {plan.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">por persona</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep('select-discipline')}
                className="flex-1"
              >
                Atrás
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Select Members */}
        {currentStep === 'select-members' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Selecciona los Miembros</h2>
            <p className="text-sm text-gray-500 mb-6">
              {selectedPlan && (
                <>
                  Necesitas seleccionar <strong>{selectedPlan.num_people}</strong> miembro(s) (
                  {selectedMembers.length}/{selectedPlan.num_people} seleccionados)
                </>
              )}
            </p>

            {/* Miembros seleccionados */}
            {selectedMembers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Miembros Seleccionados</h3>
                <div className="space-y-2">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {member.name}
                          {member.isPrimary && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              ⭐ Titular
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{member.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!member.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(member.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Hacer titular
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buscar y agregar miembros */}
            {selectedPlan && selectedMembers.length < selectedPlan.num_people && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Agregar Miembro</h3>
                  <Button
                    variant="secondary"
                    onClick={handleOpenNewMemberModal}
                    className="text-sm"
                  >
                    + Crear Nuevo
                  </Button>
                </div>

                <Input
                  type="text"
                  placeholder="Buscar por nombre, código o teléfono..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="mb-3"
                />

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredMemberList.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No se encontraron miembros</p>
                  ) : (
                    filteredMemberList.slice(0, 10).map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleAddMember(member)}
                        className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.code}</p>
                        {member.phone && <p className="text-xs text-gray-400">📞 {member.phone}</p>}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleContinueToConfirm}
                disabled={!selectedPlan || selectedMembers.length !== selectedPlan.num_people}
                className="flex-1"
              >
                Continuar
              </Button>
              <Button variant="secondary" onClick={() => setCurrentStep('select-plan')}>
                Atrás
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 'confirm' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Confirmar Membresía</h2>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'qr'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold text-gray-900">Pago QR</h3>
                </button>

                <button
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💵</div>
                  <h3 className="font-semibold text-gray-900">Efectivo</h3>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Summary */}
            {selectedDiscipline && selectedPlan && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-3">
                  Resumen de la membresía grupal:
                </p>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <span className="font-semibold">Disciplina:</span> {selectedDiscipline.name}
                  </p>
                  <p>
                    <span className="font-semibold">Plan:</span> {selectedPlan.num_months}{' '}
                    {selectedPlan.num_months === 1 ? 'mes' : 'meses'} - {selectedPlan.num_people}{' '}
                    persona(s)
                  </p>
                  <p>
                    <span className="font-semibold">Miembros:</span>
                  </p>
                  <ul className="ml-4 space-y-1">
                    {selectedMembers.map((member) => (
                      <li key={member.id}>
                        • {member.name} {member.isPrimary && '(Titular)'}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <span className="font-semibold">Método de Pago:</span>{' '}
                    {paymentMethod === 'qr' ? 'Pago QR' : 'Efectivo'}
                  </p>
                  <p>
                    <span className="font-semibold">Inicio:</span> Hoy (
                    {new Date().toLocaleDateString('es-ES')})
                  </p>
                  <p>
                    <span className="font-semibold">Vencimiento:</span>{' '}
                    {calculateEndDate(new Date(), selectedPlan.num_months).toLocaleDateString(
                      'es-ES'
                    )}
                  </p>
                  <p className="pt-2 border-t border-green-300 text-base">
                    <span className="font-semibold">Total:</span> Bs{' '}
                    {(selectedPlan.price * selectedMembers.length).toFixed(2)} (
                    {selectedMembers.length} × Bs {selectedPlan.price.toFixed(2)})
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSubmit} loading={loading} className="flex-1">
                Crear Membresía Grupal
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentStep('select-members')}
                disabled={loading}
              >
                Atrás
              </Button>
            </div>
          </Card>
        )}

        {/* Modal: Crear Nuevo Miembro */}
        {showNewMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Crear Nuevo Cliente</h3>

              <div className="space-y-4">
                <Input
                  label="Nombre Completo"
                  value={newMemberData.name}
                  onChange={(e) => handleNewMemberChange('name', e.target.value)}
                  error={newMemberErrors.name}
                  required
                  placeholder="Ej: Juan Pérez"
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={newMemberData.phone}
                  onChange={(e) => handleNewMemberChange('phone', e.target.value)}
                  error={newMemberErrors.phone}
                  required
                  placeholder="Ej: 70012345"
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
                <Button onClick={handleCreateNewMember} loading={loading} className="flex-1">
                  Crear y Agregar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCloseNewMemberModal}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGymLayout>
  );
};
