import { useEffect, useState } from 'react';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  todayAttendances: number;
  monthlyRevenue: number;
  expiringMemberships: number;
}

interface RecentAttendance {
  id: string;
  member: {
    name: string;
    code: string;
  };
  checked_at: string;
}

export const AdminGymDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentAttendances, setRecentAttendances] = useState<RecentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        // Fetch estadísticas del dashboard (incluye ingresos mensuales calculados)
        const [statsRes, recentRes] = await Promise.all([
          axios.get(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/attendances?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Establecer datos de estadísticas
        const stats = statsRes.data.data;
        setData({
          totalMembers: stats.totalMembers,
          activeMembers: stats.activeMembers,
          todayAttendances: stats.todayAttendances,
          monthlyRevenue: stats.monthlyRevenue,
          expiringMemberships: stats.expiringMemberships,
        });

        // Últimas asistencias
        setRecentAttendances(recentRes.data.data || []);

      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminGymLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </AdminGymLayout>
    );
  }

  if (error) {
    return (
      <AdminGymLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </AdminGymLayout>
    );
  }

  const metrics = [
    {
      title: 'Total Miembros',
      value: data?.totalMembers || 0,
      icon: '👥',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Miembros Activos',
      value: data?.activeMembers || 0,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Ingresos del Mes',
      value: `Bs ${data?.monthlyRevenue.toFixed(2) || '0.00'}`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Por Vencer (7 días)',
      value: data?.expiringMemberships || 0,
      icon: '⚠️',
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <AdminGymLayout>
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">Dashboard</h1>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-2 lg:p-3 rounded-lg ${metric.color} flex-shrink-0`}>
                  <span className="text-xl lg:text-2xl">{metric.icon}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Últimas Asistencias */}
        <Card title="Últimas Asistencias">
          {recentAttendances.length === 0 ? (
            <p className="text-gray-500 text-center py-6 lg:py-8 text-sm lg:text-base">
              No hay asistencias recientes
            </p>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {recentAttendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm lg:text-base truncate">
                      {attendance.member.name}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      Código: {attendance.member.code}
                    </p>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 flex-shrink-0">
                    {new Date(attendance.checked_at).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminGymLayout>
  );
};
