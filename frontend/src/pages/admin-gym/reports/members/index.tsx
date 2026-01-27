import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../../components/layout/AdminGymLayout';
import { Card } from '../../../../components/ui/Card';
import { DateRangePicker } from '../../../../components/reports/DateRangePicker';
import { MembersChart } from '../../../../components/reports/MembersChart';
import { TOKEN_KEY, API_URL } from '../../../../constants/auth';
import axios from 'axios';
import { startOfMonth, endOfMonth } from 'date-fns';

interface MembersReportData {
  summary: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembers: number;
  };
  byMonth: Array<{
    month: string;
    newMembers: number;
    totalActive: number;
  }>;
  byDiscipline: Array<{
    disciplineId: string;
    disciplineName: string;
    activeCount: number;
    percentage: number;
  }>;
}

export const MembersReport = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MembersReportData | null>(null);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await axios.get(
        `${API_URL}/reports/members?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(response.data.data);
    } catch (error: any) {
      console.error('Error cargando reporte:', error);
      alert('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <AdminGymLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => push('/admin-gym/reports')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Reportes
          </button>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            👥 Members
          </h1>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </Card>

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando reporte...</p>
            </div>
          </Card>
        ) : !data ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">No se pudo cargar el reporte</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <Card className="border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                      {data.summary.totalMembers}
                    </p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </Card>

              <Card className="border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Activos</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">
                      {data.summary.activeMembers}
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </Card>

              <Card className="border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactivos</p>
                    <p className="text-2xl lg:text-3xl font-bold text-red-600">
                      {data.summary.inactiveMembers}
                    </p>
                  </div>
                  <div className="text-3xl">❌</div>
                </div>
              </Card>

              <Card className="border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nuevos (período)</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                      {data.summary.newMembers}
                    </p>
                  </div>
                  <div className="text-3xl">🆕</div>
                </div>
              </Card>
            </div>

            {/* Chart */}
            {data.byMonth.length > 0 && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Crecimiento de Members
                </h3>
                <MembersChart data={data.byMonth} />
              </Card>
            )}

            {/* By Discipline */}
            {data.byDiscipline.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Distribución por Disciplina
                </h3>
                <div className="space-y-3">
                  {data.byDiscipline.map((discipline) => (
                    <div
                      key={discipline.disciplineId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {discipline.disciplineName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${discipline.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                            {discipline.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-green-600 text-xl">
                          {discipline.activeCount}
                        </p>
                        <p className="text-xs text-gray-500">activos</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los porcentajes se calculan sobre las membresías
                    activas. Un member puede tener múltiples membresías activas.
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminGymLayout>
  );
};
