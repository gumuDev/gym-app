import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminGymLayout } from '../../../../components/layout/AdminGymLayout';
import { Card } from '../../../../components/ui/Card';
import { DateRangePicker } from '../../../../components/reports/DateRangePicker';
import { IncomeChart } from '../../../../components/reports/IncomeChart';
import { TOKEN_KEY, API_URL } from '../../../../constants/auth';
import { showError } from '../../../../utils/notification';
import axios from 'axios';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface IncomeReportData {
  summary: {
    totalIncome: number;
    totalMemberships: number;
    averageTicket: number;
  };
  byDiscipline: Array<{
    disciplineId: string;
    disciplineName: string;
    income: number;
    count: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    income: number;
    count: number;
  }>;
  memberships: Array<{
    id: string;
    date: string;
    memberName: string;
    memberCode: string;
    disciplineName: string;
    amount: number;
    paymentMethod: string | null;
  }>;
}

export const IncomeReport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IncomeReportData | null>(null);
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

      const response = await axios.get(`${API_URL}/reports/income?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  return (
    <AdminGymLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Link
            to="/admin-gym/reports"
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Reportes
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            💰 Ingresos
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
              <Card className="border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Ingresos</p>
                    <p className="text-2xl lg:text-3xl font-bold text-green-600">
                      Bs {data.summary.totalIncome.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </Card>

              <Card className="border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Membresías Vendidas</p>
                    <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                      {data.summary.totalMemberships}
                    </p>
                  </div>
                  <div className="text-3xl">🎫</div>
                </div>
              </Card>

              <Card className="border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Promedio</p>
                    <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                      Bs {data.summary.averageTicket.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Ingresos por Mes
              </h3>
              <IncomeChart data={data.byMonth} />
            </Card>

            {/* By Discipline */}
            {data.byDiscipline.length > 0 && (
              <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Ingresos por Disciplina
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
                        <p className="text-sm text-gray-500">
                          {discipline.count} membresías
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          Bs {discipline.income.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {discipline.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Memberships Table */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Detalle de Ventas ({data.memberships.length})
              </h3>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Disciplina
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Método Pago
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.memberships.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(m.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {m.memberName}
                          </div>
                          <div className="text-sm text-gray-500">{m.memberCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {m.disciplineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {m.paymentMethod || 'No especificado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                          Bs {m.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-3">
                {data.memberships.map((m) => (
                  <div key={m.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{m.memberName}</p>
                        <p className="text-sm text-gray-500">{m.memberCode}</p>
                      </div>
                      <span className="font-bold text-green-600">
                        Bs {m.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{m.disciplineName}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(m.date), 'dd/MM/yyyy')} •{' '}
                        {m.paymentMethod || 'No especificado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminGymLayout>
  );
};
