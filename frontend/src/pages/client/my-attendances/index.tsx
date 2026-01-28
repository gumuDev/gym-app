import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClientLayout } from '../../../components/layout/ClientLayout';
import { Card } from '../../../components/ui/Card';
import { TOKEN_KEY, USER_KEY, API_URL } from '../../../constants/auth';

interface Attendance {
  id: string;
  checked_at: string;
  created_at: string;
}

export const ClientMyAttendances = () => {
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
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
        `${API_URL}/attendances/member/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const attendanceData = response.data.data || [];
      setAttendances(attendanceData);
      calculateStreak(attendanceData);
    } catch (err: any) {
      console.error('Error fetching attendances:', err);
      setError('Error al cargar asistencias');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (attendanceData: Attendance[]) => {
    if (attendanceData.length === 0) {
      setStreak(0);
      return;
    }

    // Sort by date descending
    const sorted = attendanceData
      .map(a => new Date(a.checked_at).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Remove duplicates (same day)
    const uniqueDates = Array.from(new Set(sorted));

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if most recent attendance is today or yesterday
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.ceil(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    setStreak(currentStreak);
  };

  const getAttendancesForMonth = () => {
    return attendances.filter(a => {
      const attendanceDate = new Date(a.checked_at);
      return (
        attendanceDate.getMonth() === currentMonth.getMonth() &&
        attendanceDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasAttendanceOnDate = (day: number) => {
    const dateToCheck = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toDateString();

    return getAttendancesForMonth().some(
      a => new Date(a.checked_at).toDateString() === dateToCheck
    );
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getLastAttendance = () => {
    if (attendances.length === 0) return null;
    return attendances.reduce((latest, current) => {
      return new Date(current.checked_at) > new Date(latest.checked_at)
        ? current
        : latest;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando asistencias...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const monthAttendances = getAttendancesForMonth();
  const lastAttendance = getLastAttendance();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  return (
    <ClientLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Mis Asistencias
          </h1>
          <p className="text-sm text-gray-600">
            Historial y estadísticas de entrenamiento
          </p>
        </div>

        {error && (
          <Card className="mb-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-2xl font-bold">{monthAttendances.length}</div>
            <div className="text-xs mt-1">Este Mes</div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-2xl font-bold flex items-center justify-center">
              <span className="mr-1">🔥</span>
              {streak}
            </div>
            <div className="text-xs mt-1">Racha</div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-2xl font-bold">{attendances.length}</div>
            <div className="text-xs mt-1">Total</div>
          </Card>
        </div>

        {/* Last Attendance */}
        {lastAttendance && (
          <Card className="mb-6 bg-blue-50 border-l-4 border-blue-500">
            <div>
              <p className="text-xs text-blue-700 font-medium mb-1">
                Última asistencia
              </p>
              <p className="text-sm font-semibold text-blue-900">
                {formatDate(lastAttendance.checked_at)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {formatTime(lastAttendance.checked_at)}
              </p>
            </div>
          </Card>
        )}

        {/* Calendar */}
        <Card className="mb-6">
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h3 className="font-semibold text-gray-900 capitalize">
              {currentMonth.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <button
              onClick={() => changeMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day Headers */}
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
              <div
                key={i}
                className="text-xs font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasAttendance = hasAttendanceOnDate(day);
              const isToday =
                day === new Date().getDate() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                    hasAttendance
                      ? 'bg-green-500 text-white font-bold'
                      : isToday
                      ? 'bg-gray-200 text-gray-900 font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {day}
                  {hasAttendance && (
                    <span className="text-xs ml-0.5">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Con asistencia</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Hoy</span>
            </div>
          </div>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center">
          <div className="text-3xl mb-2">💪</div>
          <p className="font-semibold mb-1">
            {streak > 0
              ? `¡${streak} día${streak !== 1 ? 's' : ''} de racha!`
              : '¡Empieza tu racha hoy!'}
          </p>
          <p className="text-sm text-purple-100">
            {streak > 5
              ? '¡Increíble constancia! Sigue así.'
              : 'La constancia es la clave del éxito.'}
          </p>
        </Card>
      </div>
    </ClientLayout>
  );
};
