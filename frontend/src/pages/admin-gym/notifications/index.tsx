import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Notification {
  id: string;
  type: 'WELCOME' | 'EXPIRING_SOON' | 'EXPIRED';
  channel: 'TELEGRAM' | 'EMAIL';
  status: 'SENT' | 'FAILED';
  sent_at: string;
  message: string;
  error?: string;
  member: {
    name: string;
    code: string;
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

interface NotificationsResponse {
  data: Notification[];
  pagination: PaginationMeta;
}

const typeLabels = {
  WELCOME: { label: 'Bienvenida', color: 'bg-green-100 text-green-800' },
  EXPIRING_SOON: { label: 'Por Vencer', color: 'bg-yellow-100 text-yellow-800' },
  EXPIRED: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
};

const statusLabels = {
  SENT: { label: 'Enviado', icon: '✅' },
  FAILED: { label: 'Fallido', icon: '❌' },
};

export const NotificationsList = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false,
  });
  const [filter, setFilter] = useState<'all' | 'SENT' | 'FAILED'>('all');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]);

  const fetchNotifications = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);

      // Construir query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await axios.get<{ data: NotificationsResponse }>(
        `${API_URL}/notifications?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = response.data.data;
      setNotifications(result.data || []);
      setPagination(result.pagination);
    } catch (error: any) {
      console.error('Error cargando notificaciones:', error);
      alert('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    if (!confirm('¿Ejecutar verificación manual de notificaciones?\n\nEsto enviará notificaciones a members con membresías por vencer.')) {
      return;
    }

    try {
      setTestLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.post(
        `${API_URL}/notifications/test`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('✅ Verificación ejecutada. Revisa los logs del servidor.');

      // Recargar notificaciones desde la primera página
      await fetchNotifications(1);
    } catch (error: any) {
      console.error('Error ejecutando test:', error);
      alert('Error al ejecutar verificación manual');
    } finally {
      setTestLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage);
  };

  const handleFilterChange = (newFilter: 'all' | 'SENT' | 'FAILED') => {
    setFilter(newFilter);
    // El useEffect se encargará de recargar las notificaciones con el nuevo filtro
  };

  // Obtener estadísticas totales (haciendo request adicional si es necesario)
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Obtener totales para cada estado
      const [allRes, sentRes, failedRes] = await Promise.all([
        axios.get(`${API_URL}/notifications?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/notifications?status=SENT&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/notifications?status=FAILED&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        total: allRes.data.data.pagination.total,
        sent: sentRes.data.data.pagination.total,
        failed: failedRes.data.data.pagination.total,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <AdminGymLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Notificaciones
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                Historial de notificaciones enviadas por Telegram
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleTestNotifications}
                loading={testLoading}
                className="flex-1 lg:flex-initial"
              >
                🔧 Test Manual
              </Button>
              <Button
                variant="secondary"
                onClick={() => push('/admin-gym/settings')}
                className="flex-1 lg:flex-initial"
              >
                ⚙️ Configurar Bot
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </Card>

          <Card className="border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fallidas</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({stats.total})
          </button>
          <button
            onClick={() => handleFilterChange('SENT')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'SENT'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Enviadas ({stats.sent})
          </button>
          <button
            onClick={() => handleFilterChange('FAILED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'FAILED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fallidas ({stats.failed})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando notificaciones...</p>
            </div>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sin notificaciones
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all'
                  ? 'Aún no se han enviado notificaciones.'
                  : `No hay notificaciones ${filter === 'SENT' ? 'enviadas' : 'fallidas'}.`}
              </p>
              <Button variant="secondary" onClick={() => push('/admin-gym/settings')}>
                Configurar Telegram Bot
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mensaje
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(notification.sent_at).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {notification.member.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                typeLabels[notification.type].color
                              }`}
                            >
                              {typeLabels[notification.type].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {statusLabels[notification.status].icon}{' '}
                            {statusLabels[notification.status].label}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {notification.message.split('\n')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {notification.member.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {notification.member.code}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          typeLabels[notification.type].color
                        }`}
                      >
                        {typeLabels[notification.type].label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {new Date(notification.sent_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-medium">
                        {statusLabels[notification.status].icon}{' '}
                        {statusLabels[notification.status].label}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message.split('\n')[0]}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Card className="mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
                  <div className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    -{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-medium">{pagination.total}</span> notificaciones
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevious || loading}
                      className="px-3 py-2"
                    >
                      ← Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number;

                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              pagination.page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasMore || loading}
                      className="px-3 py-2"
                    >
                      Siguiente →
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminGymLayout>
  );
};
