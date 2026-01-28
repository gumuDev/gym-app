import { useState } from 'react';
import { useTable, useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showError, showSuccess } from '../../../utils/notification';
import axios from 'axios';

interface Discipline {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    pricing_plans: number;
    memberships: number;
  };
}

interface PricingPlan {
  id: string;
  num_people: number;
  num_months: number;
  price: number;
}

interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
}

interface Membership {
  member: Member;
  status: string;
  start_date: string;
  end_date: string;
}

export const DisciplinesList = () => {
  const { tableQueryResult } = useTable<Discipline>({
    resource: 'disciplines',
  });

  const { push } = useNavigation();

  const { data, isLoading } = tableQueryResult;

  // Estados para modales
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [members, setMembers] = useState<Membership[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const toggleDisciplineStatus = async (disciplineId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.patch(
        `${API_URL}/disciplines/${disciplineId}`,
        { is_active: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess(`Disciplina ${!currentStatus ? 'activada' : 'desactivada'} correctamente`);
      tableQueryResult.refetch();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al actualizar disciplina');
    }
  };

  // Ver planes de una disciplina
  const handleViewPlans = async (discipline: Discipline) => {
    try {
      setSelectedDiscipline(discipline);
      setLoadingModal(true);
      setShowPlansModal(true);

      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/pricing?disciplineId=${discipline.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(response.data.data || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al cargar planes');
    } finally {
      setLoadingModal(false);
    }
  };

  // Ver miembros de una disciplina
  const handleViewMembers = async (discipline: Discipline) => {
    try {
      setSelectedDiscipline(discipline);
      setLoadingModal(true);
      setShowMembersModal(true);

      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/memberships?disciplineId=${discipline.id}&status=ACTIVE`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers(response.data.data || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al cargar miembros');
    } finally {
      setLoadingModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminGymLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Disciplinas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data?.total || 0} disciplinas registradas
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/disciplines/create')}>
            <span className="hidden sm:inline">+ Crear Disciplina</span>
            <span className="sm:hidden">+ Crear</span>
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Descripción
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Planes
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Miembros
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Creada
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((discipline) => (
                      <tr key={discipline.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{discipline.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {discipline.description || 'Sin descripción'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {discipline._count?.pricing_plans || 0} planes
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            {discipline._count?.memberships || 0} activos
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              discipline.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {discipline.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {formatDate(discipline.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewPlans(discipline)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver Planes"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewMembers(discipline)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Ver Miembros"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => push(`/admin-gym/disciplines/edit/${discipline.id}`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleDisciplineStatus(discipline.id, discipline.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                discipline.is_active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={discipline.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {discipline.is_active ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="lg:hidden space-y-4">
                {data.data.map((discipline) => (
                  <div key={discipline.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{discipline.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {discipline.description || 'Sin descripción'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          discipline.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {discipline.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {discipline._count?.pricing_plans || 0} planes
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                        {discipline._count?.memberships || 0} miembros
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Creada: {formatDate(discipline.created_at)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewPlans(discipline)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        📋 Planes
                      </button>
                      <button
                        onClick={() => handleViewMembers(discipline)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                      >
                        👥 Miembros
                      </button>
                      <button
                        onClick={() => push(`/admin-gym/disciplines/edit/${discipline.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => toggleDisciplineStatus(discipline.id, discipline.is_active)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${
                          discipline.is_active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {discipline.is_active ? '✗ Desactivar' : '✓ Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm lg:text-base">
                No hay disciplinas registradas
              </p>
              <Button onClick={() => push('/admin-gym/disciplines/create')}>
                Crear Primera Disciplina
              </Button>
            </div>
          )}
        </Card>

        {/* Modal de Planes */}
        {showPlansModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Planes de {selectedDiscipline?.name}
                </h3>
                <button
                  onClick={() => setShowPlansModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {loadingModal ? (
                  <p className="text-center text-gray-500 py-8">Cargando...</p>
                ) : plans.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay planes registrados</p>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div key={plan.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">
                              {plan.num_people} {plan.num_people === 1 ? 'persona' : 'personas'} - {plan.num_months} {plan.num_months === 1 ? 'mes' : 'meses'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Bs {plan.price.toFixed(2)} / {plan.num_months} {plan.num_months === 1 ? 'mes' : 'meses'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">Bs {plan.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              Bs {(plan.price / plan.num_months).toFixed(2)}/mes
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowPlansModal(false)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Miembros */}
        {showMembersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Miembros Activos - {selectedDiscipline?.name}
                </h3>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {loadingModal ? (
                  <p className="text-center text-gray-500 py-8">Cargando...</p>
                ) : members.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay miembros activos</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((membership) => (
                      <div key={membership.member.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{membership.member.name}</p>
                            <p className="text-sm text-gray-500 font-mono">{membership.member.code}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              📞 {membership.member.phone}
                            </p>
                            {membership.member.email && (
                              <p className="text-sm text-gray-600 truncate">
                                ✉️ {membership.member.email}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Activo
                            </span>
                            <p className="text-gray-500 mt-2">
                              Vence: {new Date(membership.end_date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowMembersModal(false)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGymLayout>
  );
};
