import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { useParams } from 'react-router-dom';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
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
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  amount_paid: number;
  payment_method?: string;
  notes?: string;
}

export const MembershipsEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembership = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await axios.get(`${API_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const memberships = response.data.data || [];
      const foundMembership = memberships.find((m: Membership) => m.id === id);

      if (!foundMembership) {
        alert('Membresía no encontrada');
        push('/admin-gym/memberships');
        return;
      }

      setMembership(foundMembership);
    } catch (error: any) {
      alert('Error al cargar la membresía');
      push('/admin-gym/memberships');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = async () => {
    if (!membership) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Backend doesn't have a cancel endpoint yet
      alert('Funcionalidad de cancelación en desarrollo. Contacta al administrador.');
      setShowCancelConfirm(false);
    } catch (error: any) {
      alert('Error al cancelar la membresía');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AdminGymLayout>
      <div className="h-full flex flex-col">
        {/* Header - Fixed */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Detalle de Membresía
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                {membership.member.name} - {membership.discipline.name}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => push('/admin-gym/memberships')}
              className="hidden lg:inline-flex"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Content - 2 Columns on Desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 overflow-hidden">
          {/* Left Column - Info */}
          <div className="space-y-4 overflow-y-auto lg:pr-2">
            {/* Datos de la Membresía */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Información
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Cliente:</span>
                  <span className="font-medium text-gray-900">
                    {membership.member.name}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Código:</span>
                  <span className="font-medium text-gray-900">
                    {membership.member.code}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Disciplina:</span>
                  <span className="font-medium text-gray-900">
                    {membership.discipline.name}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Estado:</span>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      membership.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : membership.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {membership.status === 'ACTIVE'
                      ? 'Activa'
                      : membership.status === 'EXPIRED'
                      ? 'Vencida'
                      : 'Cancelada'}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Inicio:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(membership.start_date)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Vencimiento:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(membership.end_date)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Monto Pagado:</span>
                  <span className="font-medium text-gray-900">
                    Bs {membership.amount_paid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Método de Pago:</span>
                  <span className="font-medium text-gray-900">
                    {membership.payment_method === 'qr'
                      ? 'Pago QR'
                      : membership.payment_method === 'efectivo'
                      ? 'Efectivo'
                      : membership.payment_method || 'No especificado'}
                  </span>
                </div>
                {membership.notes && (
                  <div className="pt-2">
                    <p className="text-gray-500 mb-1">Notas:</p>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">
                      {membership.notes}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Info Box */}
            <Card className="border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Limitaciones de edición</p>
                  <p className="text-blue-800">
                    Las fechas y disciplina no se pueden modificar. Usa las acciones de la derecha según tu necesidad.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4 overflow-y-auto lg:pl-2">
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Acciones Rápidas
              </h2>

              <div className="space-y-3">
                {/* Renovar */}
                {membership.status === 'ACTIVE' && (
                  <button
                    onClick={() => push(`/admin-gym/memberships/renew/${membership.id}`)}
                    className="w-full p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🔄</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 group-hover:text-green-700">
                          Renovar Membresía
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          Crear nueva membresía manteniendo la disciplina
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-green-600"
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
                )}

                {/* Ver Cliente */}
                <button
                  onClick={() => push(`/admin-gym/members/show/${membership.member.id}`)}
                  className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">👤</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 group-hover:text-blue-700">
                        Ver Perfil del Cliente
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Todas las membresías y asistencias
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-blue-600"
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

                {/* Cancelar */}
                {membership.status === 'ACTIVE' && !showCancelConfirm && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">❌</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 group-hover:text-red-700">
                          Cancelar Membresía
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          Marcar como cancelada por error
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-red-600"
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
                )}

                {/* Confirmación de cancelación */}
                {showCancelConfirm && (
                  <Card className="border-2 border-red-500 bg-red-50">
                    <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      Confirmar Cancelación
                    </h3>
                    <p className="text-sm text-red-800 mb-4">
                      ¿Estás seguro? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancel}
                        loading={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Sí, Cancelar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={loading}
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            {/* Mobile Back Button */}
            <div className="lg:hidden">
              <Button
                variant="secondary"
                onClick={() => push('/admin-gym/memberships')}
                className="w-full"
              >
                ← Volver a Lista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGymLayout>
  );
};
