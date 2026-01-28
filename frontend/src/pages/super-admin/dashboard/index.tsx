import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '../../../components/layout/SuperAdminLayout';
import { Card } from '../../../components/ui/Card';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface DashboardData {
  totalGyms: number;
  activeGyms: number;
  totalMembers: number;
  monthlyRecurringRevenue: number;
}

export const SuperAdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get<{ data: DashboardData }>(
          `${API_URL}/super-admin/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(response.data.data);
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
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </SuperAdminLayout>
    );
  }

  const metrics = [
    {
      title: 'Total Gimnasios',
      value: data?.totalGyms || 0,
      icon: '🏢',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Gimnasios Activos',
      value: data?.activeGyms || 0,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Total Miembros',
      value: data?.totalMembers || 0,
      icon: '👥',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'MRR',
      value: `Bs ${data?.monthlyRecurringRevenue.toFixed(2) || '0.00'}`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  return (
    <SuperAdminLayout>
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

        <div className="mt-6 lg:mt-8">
          <Card title="Actividad Reciente">
            <p className="text-gray-500 text-center py-6 lg:py-8 text-sm lg:text-base">
              No hay actividad reciente para mostrar
            </p>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};
