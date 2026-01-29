import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClientLayout } from '../../../components/layout/ClientLayout';
import { Card } from '../../../components/ui/Card';
import { TOKEN_KEY, USER_KEY, API_URL } from '../../../constants/auth';

interface MembershipMember {
  id: string;
  member_id: string;
  price_applied: number;
  is_primary: boolean;
}

interface Membership {
  id: string;
  discipline: {
    name: string;
    description?: string;
  };
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  amount_paid?: number | null; // Opcional para compatibilidad
  total_amount?: number | null; // Para membresías grupales
  membershipMembers?: MembershipMember[]; // Para membresías grupales
}

export const ClientMyMembership = () => {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (!userStr) {
        setError('Usuario no encontrado');
        return;
      }

      const user = JSON.parse(userStr);
      const memberId = user.id;

      const response = await axios.get(
        `${API_URL}/memberships/member/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const memberships = response.data.data || [];
      let activeMembership = memberships.find(
        (m: Membership) => m.status === 'ACTIVE'
      );

      if (activeMembership) {
        // Si es membresía grupal, filtrar solo el membershipMember del usuario actual
        if (activeMembership.membershipMembers && activeMembership.membershipMembers.length > 0) {
          const currentMemberData = activeMembership.membershipMembers.find(
            (mm: MembershipMember) => mm.member_id === memberId
          );

          if (currentMemberData) {
            // Crear una copia con solo el membershipMember del usuario actual
            activeMembership = {
              ...activeMembership,
              membershipMembers: [currentMemberData],
            };
          }
        }

        setMembership(activeMembership);

        // Calculate days remaining
        const endDate = new Date(activeMembership.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(diffDays);
      }
    } catch (err: any) {
      console.error('Error fetching membership:', err);
      setError('Error al cargar membresía');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressPercentage = () => {
    if (!membership) return 0;

    const startDate = new Date(membership.start_date);
    const endDate = new Date(membership.end_date);
    const today = new Date();

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando membresía...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Mi Membresía
          </h1>
          <p className="text-sm text-gray-600">Estado de tu membresía actual</p>
        </div>

        {error && (
          <Card className="mb-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {membership ? (
          <div className="space-y-4">
            {/* Status Card */}
            <Card
              className={`border-l-4 ${
                membership.status === 'ACTIVE'
                  ? daysRemaining <= 7
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {membership.discipline.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {membership.discipline.description}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    membership.status === 'ACTIVE'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {membership.status === 'ACTIVE' ? 'ACTIVA' : 'VENCIDA'}
                </div>
              </div>

              {/* Days Remaining */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tiempo restante
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      daysRemaining <= 7
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}
                  >
                    {daysRemaining > 0
                      ? `${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`
                      : daysRemaining === 0
                      ? 'Vence hoy'
                      : 'Vencida'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      daysRemaining <= 7 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Warning */}
              {daysRemaining <= 7 && daysRemaining > 0 && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-yellow-800 flex items-center">
                    <span className="text-lg mr-2">⚠️</span>
                    Tu membresía está por vencer. Renueva pronto para seguir
                    entrenando.
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Fecha de inicio</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(membership.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Fecha de fin</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(membership.end_date)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">
                Información de pago
              </h3>
              {membership.membershipMembers && membership.membershipMembers.length > 0 ? (
                // Membresía grupal: mostrar precio aplicado al miembro
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tu precio</span>
                    <span className="text-2xl font-bold text-green-600">
                      Bs {membership.membershipMembers[0].price_applied.toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Tipo de membresía</span>
                      <span className="text-gray-700 font-medium">
                        Grupal ({membership.membershipMembers.length} {membership.membershipMembers.length === 1 ? 'persona' : 'personas'})
                      </span>
                    </div>
                    {membership.total_amount && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-500">Total grupal</span>
                        <span className="text-gray-700 font-medium">
                          Bs {membership.total_amount.toLocaleString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Membresía individual (legacy)
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monto pagado</span>
                  <span className="text-2xl font-bold text-green-600">
                    Bs {(membership.amount_paid || 0).toLocaleString('es-ES')}
                  </span>
                </div>
              )}
            </Card>

            {/* Renewal CTA */}
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">¿Quieres renovar?</h3>
                <p className="text-sm text-green-100 mb-4">
                  Acércate a recepción para renovar tu membresía
                </p>
                <div className="inline-flex items-center text-sm font-medium">
                  <span className="text-2xl mr-2">🏋️‍♂️</span>
                  Sigue entrenando sin interrupciones
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="border-l-4 border-red-500 bg-red-50 text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sin Membresía Activa
            </h2>
            <p className="text-gray-700 mb-4">
              Actualmente no tienes una membresía activa.
            </p>
            <p className="text-sm text-gray-600">
              Acércate a recepción para adquirir una nueva membresía y empezar
              a entrenar.
            </p>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
};
