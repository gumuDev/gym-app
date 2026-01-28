import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../../components/layout/AdminGymLayout';
import { Card } from '../../../../components/ui/Card';
import { DateRangePicker } from '../../../../components/reports/DateRangePicker';
import { AttendanceChart } from '../../../../components/reports/AttendanceChart';
import { TOKEN_KEY, API_URL } from '../../../../constants/auth';
import { showError } from '../../../../utils/notification';
import axios from 'axios';
import { startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceReportData {
  summary: {
    totalAttendances: number;
    uniqueMembers: number;
    averagePerDay: number;
  };
  byDay: Array<{
    date: string;
    count: number;
  }>;
  byHour: Array<{
    hour: number;
    count: number;
  }>;
  topMembers: Array<{
    memberId: string;
    memberName: string;
    memberCode: string;
    count: number;
  }>;
}

export const AttendanceReport = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttendanceReportData | null>(null);
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
        `${API_URL}/reports/attendance?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(response.data.data);
    } catch (error: any) {
      console.error('Error cargando reporte:', error);
      showError('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const formatHour = (hour: number) => {
    return hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
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
            📅 Asistencias
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <Card className="border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Asistencias</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                      {data.summary.totalAttendances}
                    </p>
                  </div>
                  <div className="text-3xl">📋</div>
                </div>
              </Card>

              <Card className="border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Members Únicos</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">
                      {data.summary.uniqueMembers}
                    </p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </Card>

              <Card className="border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Promedio por Día</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                      {data.summary.averagePerDay.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Asistencias por Día
              </h3>
              <AttendanceChart data={data.byDay} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Members */}
              {data.topMembers.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Top 10 Members Más Activos
                  </h3>
                  <div className="space-y-2">
                    {data.topMembers.map((member, index) => (
                      <div
                        key={member.memberId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.memberName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.memberCode}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-blue-600">
                          {member.count} veces
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* By Hour */}
              {data.byHour.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Horas Pico
                  </h3>
                  <div className="space-y-2">
                    {data.byHour
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 10)
                      .map((hour) => (
                        <div
                          key={hour.hour}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-800">
                            {formatHour(hour.hour)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(hour.count / data.summary.totalAttendances) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-bold text-blue-600 min-w-[3rem] text-right">
                              {hour.count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </AdminGymLayout>
  );
};
