import { useEffect, useState } from 'react';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  todayAttendances: number;
  monthlyRevenue: number;
}

interface RecentAttendance {
  id: string;
  member: {
    name: string;
    code: string;
  };
  checked_at: string;
}

interface IncomeChartData {
  day: string;
  income: number;
}

interface DisciplineData {
  name: string;
  value: number;
  percentage: number;
}

export const AdminGymDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentAttendances, setRecentAttendances] = useState<RecentAttendance[]>([]);
  const [incomeChartData, setIncomeChartData] = useState<IncomeChartData[]>([]);
  const [disciplineData, setDisciplineData] = useState<DisciplineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        // Fetch estadísticas del dashboard, gráficas y asistencias
        const [statsRes, recentRes, incomeChartRes, disciplineRes] = await Promise.all([
          axios.get(`${API_URL}/stats/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/attendances?limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/stats/monthly-income-chart`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/stats/discipline-distribution`, {
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
        });

        // Últimas asistencias
        setRecentAttendances(recentRes.data.data || []);

        // Datos de gráficas
        setIncomeChartData(incomeChartRes.data.data || []);
        setDisciplineData(disciplineRes.data.data || []);

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
      title: 'Asistencias Hoy',
      value: data?.todayAttendances || 0,
      icon: '📅',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Ingresos del Mes',
      value: `Bs ${data?.monthlyRevenue.toFixed(2) || '0.00'}`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  // Colores para el pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <AdminGymLayout>
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">Dashboard</h1>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-800 break-words">
                    {metric.value}
                  </p>
                </div>
                <div className={`rounded-lg ${metric.color} p-2 lg:p-3 flex-shrink-0`}>
                  <span className="text-xl lg:text-2xl">{metric.icon}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Gráfica de Ingresos del Mes */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos del Mes</h3>
            {incomeChartData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos de ingresos este mes</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={incomeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`Bs ${Number(value).toFixed(2)}`, 'Ingresos']}
                    contentStyle={{ fontSize: '14px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Gráfica de Distribución por Disciplina */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Disciplina</h3>
            {disciplineData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay miembros activos</p>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disciplineData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {disciplineData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} miembros`, 'Cantidad']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
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
