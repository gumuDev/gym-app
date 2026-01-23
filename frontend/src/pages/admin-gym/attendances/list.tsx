import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
}

interface Attendance {
  id: string;
  member: Member;
  checked_at: string;
  notes?: string;
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

export const AttendancesList = () => {
  const { push } = useNavigation();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');

  useEffect(() => {
    fetchAttendances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPeriod, attendances]);

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/attendances?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setAttendances(data);
    } catch (error: any) {
      alert('Error al cargar asistencias');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...attendances];

    if (filterPeriod === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((a) => {
        const checkedDate = new Date(a.checked_at);
        checkedDate.setHours(0, 0, 0, 0);
        return checkedDate.getTime() === today.getTime();
      });
    } else if (filterPeriod === 'week') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);

      filtered = filtered.filter((a) => {
        const checkedDate = new Date(a.checked_at);
        return checkedDate >= weekAgo && checkedDate <= today;
      });
    } else if (filterPeriod === 'month') {
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setDate(today.getDate() - 30);

      filtered = filtered.filter((a) => {
        const checkedDate = new Date(a.checked_at);
        return checkedDate >= monthAgo && checkedDate <= today;
      });
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());

    setFilteredAttendances(filtered);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Asistencias</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              Registro de check-ins de tus clientes
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/attendances/scanner')}>
            📷 Escanear QR
          </Button>
        </div>

        {/* Filtros */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPeriod === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPeriod === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Último Mes
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterPeriod === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({attendances.length})
          </button>
        </div>
      </div>

      {filteredAttendances.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filterPeriod === 'today'
                ? 'No hay asistencias registradas hoy'
                : 'No hay asistencias en este período'}
            </p>
            <Button onClick={() => push('/admin-gym/attendances/scanner')}>
              Registrar Primera Asistencia
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
                        Código
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAttendances.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {attendance.member.name}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {attendance.member.code}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {formatDateTime(attendance.checked_at)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {attendance.notes ? (
                            <span className="text-sm text-gray-600">{attendance.notes}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => push(`/admin-gym/members/show/${attendance.member.id}`)}
                          >
                            Ver Cliente
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Vista Mobile - Cards */}
          <div className="lg:hidden space-y-4">
            {filteredAttendances.map((attendance) => (
              <Card key={attendance.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {attendance.member.name}
                    </h3>
                    <p className="text-sm text-gray-500">{attendance.member.code}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    ✓ Check-in
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(attendance.checked_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hora:</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(attendance.checked_at)}
                    </span>
                  </div>
                  {attendance.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-gray-500 mb-1">Notas:</p>
                      <p className="text-gray-900">{attendance.notes}</p>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => push(`/admin-gym/members/show/${attendance.member.id}`)}
                  className="w-full"
                >
                  Ver Cliente
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}
    </AdminGymLayout>
  );
};
