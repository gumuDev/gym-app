import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showError } from '../../../utils/notification';
import axios from 'axios';

interface Member {
  id: string;
  code: string;
  name: string;
  phone?: string;
}

interface Discipline {
  id: string;
  name: string;
}

interface MembershipMember {
  id: string;
  member_id: string;
  price_applied: number;
  is_primary: boolean;
  member: Member;
}

interface PricingPlan {
  id: string;
  num_people: number;
  num_months: number;
  price: number;
}

interface Membership {
  id: string;
  member?: Member; // Opcional para compatibilidad con membresías antiguas
  membershipMembers?: MembershipMember[]; // Nuevo para membresías grupales
  discipline: Discipline;
  pricingPlan?: PricingPlan;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  amount_paid?: number;
  total_amount?: number;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

type FilterStatus = 'all' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'expiring';

export const MembershipsList = () => {
  const { push } = useNavigation();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, memberships, searchTerm]);

  const fetchMemberships = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/memberships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setMemberships(data);
    } catch (error: any) {
      showError('Error al cargar membresías');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...memberships];

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((m) => {
        // Para membresías grupales, buscar en membershipMembers
        if (m.membershipMembers && m.membershipMembers.length > 0) {
          return m.membershipMembers.some((mm) =>
            mm.member.name.toLowerCase().includes(search) ||
            mm.member.code.toLowerCase().includes(search) ||
            (mm.member.phone && mm.member.phone.toLowerCase().includes(search))
          );
        }
        // Para membresías antiguas, buscar en member
        if (m.member) {
          return (
            m.member.name.toLowerCase().includes(search) ||
            m.member.code.toLowerCase().includes(search) ||
            (m.member.phone && m.member.phone.toLowerCase().includes(search))
          );
        }
        return false;
      });
    }

    // Aplicar filtro de estado
    if (filterStatus !== 'all') {
      if (filterStatus === 'expiring') {
        // Membresías que vencen en los próximos 7 días
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        filtered = filtered.filter((m) => {
          if (m.status !== 'ACTIVE') return false;
          const endDate = new Date(m.end_date);
          return endDate >= now && endDate <= sevenDaysFromNow;
        });
      } else {
        filtered = filtered.filter((m) => m.status === filterStatus);
      }
    }

    setFilteredMemberships(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      ACTIVE: 'Activa',
      EXPIRED: 'Vencida',
      CANCELLED: 'Cancelada',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]
          }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Membresías</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              Gestiona las membresías de tus clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => push('/admin-gym/memberships/create')}>
              + Nueva Individual
            </Button>
            <Button onClick={() => push('/admin-gym/memberships/create-group')} variant="secondary">
              👥 Nueva Grupal
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mt-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por nombre, código o teléfono del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button
                variant="secondary"
                onClick={() => setSearchTerm('')}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Todas ({memberships.length})
          </button>
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'ACTIVE'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Activas ({memberships.filter((m) => m.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setFilterStatus('expiring')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'expiring'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Por Vencer
          </button>
          <button
            onClick={() => setFilterStatus('EXPIRED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'EXPIRED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Vencidas ({memberships.filter((m) => m.status === 'EXPIRED').length})
          </button>
        </div>
      </div>

      {filteredMemberships.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay membresías para mostrar</p>
            <Button onClick={() => push('/admin-gym/memberships/create')}>
              Crear Primera Membresía
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disciplina
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inicio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vencimiento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMemberships.map((membership) => {
                      const daysRemaining = getDaysRemaining(membership.end_date);
                      const isExpiringSoon = membership.status === 'ACTIVE' && daysRemaining <= 7;

                      // Determinar si es membresía grupal
                      const isGroup = membership.membershipMembers && membership.membershipMembers.length > 0;
                      const memberCount = isGroup ? membership.membershipMembers?.length ?? 1 : 1;

                      // Obtener nombre(s) para mostrar
                      let memberDisplay = '';
                      if (isGroup) {
                        const names = membership.membershipMembers?.map(mm => mm.member.name) ?? [];
                        memberDisplay = names.length > 2
                          ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
                          : names.join(', ');
                      } else if (membership.member) {
                        memberDisplay = membership.member.name;
                      }

                      return (
                        <tr key={membership.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {isGroup && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                                    👥 {memberCount}
                                  </span>
                                )}
                                {memberDisplay}
                              </p>
                              {isGroup && membership.membershipMembers?.[0] && (
                                <p className="text-xs text-gray-500">{membership.membershipMembers[0].member.code}</p>
                              )}
                              {!isGroup && membership.member && (
                                <p className="text-xs text-gray-500">{membership.member.code}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-900">
                              {membership.discipline.name}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(membership.start_date)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {formatDate(membership.end_date)}
                              </p>
                              {isExpiringSoon && (
                                <p className="text-xs text-yellow-600 font-medium">
                                  {daysRemaining > 0
                                    ? `${daysRemaining} días restantes`
                                    : 'Vence hoy'}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              Bs {(membership.total_amount || membership.amount_paid || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4">{getStatusBadge(membership.status)}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {membership.status === 'ACTIVE' && (
                                <button
                                  onClick={() =>
                                    push(`/admin-gym/memberships/renew/${membership.id}`)
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Renovar"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => push(`/admin-gym/memberships/edit/${membership.id}`)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => push(`/admin-gym/members/show/${membership.member?.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver QR del Cliente"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Vista Mobile - Cards */}
          <div className="lg:hidden space-y-4">
            {filteredMemberships.map((membership) => {
              const daysRemaining = getDaysRemaining(membership.end_date);
              const isExpiringSoon = membership.status === 'ACTIVE' && daysRemaining <= 7;

              // Determinar si es membresía grupal
              const isGroup = membership.membershipMembers && membership.membershipMembers.length > 0;
              const memberCount = isGroup ? membership.membershipMembers?.length ?? 1 : 1;

              // Obtener nombre(s) para mostrar
              let memberDisplay = '';
              let memberCode = '';
              if (isGroup) {
                const names = membership.membershipMembers?.map(mm => mm.member.name) ?? [];
                memberDisplay = names.length > 2
                  ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
                  : names.join(', ');
                memberCode = membership.membershipMembers?.[0]?.member.code || '';
              } else if (membership.member) {
                memberDisplay = membership.member.name;
                memberCode = membership.member.code;
              }

              return (
                <Card key={membership.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {isGroup && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-2">
                            👥 {memberCount}
                          </span>
                        )}
                        {memberDisplay}
                      </h3>
                      <p className="text-sm text-gray-500">{memberCode}</p>
                    </div>
                    {getStatusBadge(membership.status)}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Disciplina:</span>
                      <span className="font-medium text-gray-900">
                        {membership.discipline.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Inicio:</span>
                      <span className="text-gray-900">{formatDate(membership.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vencimiento:</span>
                      <div className="text-right">
                        <p className="text-gray-900">{formatDate(membership.end_date)}</p>
                        {isExpiringSoon && (
                          <p className="text-xs text-yellow-600 font-medium">
                            {daysRemaining > 0
                              ? `${daysRemaining} días restantes`
                              : 'Vence hoy'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monto:</span>
                      <span className="font-medium text-gray-900">
                        Bs {(membership.total_amount || membership.amount_paid || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {membership.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => push(`/admin-gym/memberships/renew/${membership.id}`)}
                          className="flex-1"
                        >
                          Renovar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => push(`/admin-gym/memberships/edit/${membership.id}`)}
                        className="flex-1"
                      >
                        Editar
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => push(`/admin-gym/members/show/${membership.member?.id}`)}
                    >
                      Ver Cliente
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </AdminGymLayout>
  );
};
