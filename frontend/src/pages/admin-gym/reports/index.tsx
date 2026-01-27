import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Link } from 'react-router-dom';

export const ReportsDashboard = () => {

  const reportCards = [
    {
      title: 'Reporte de Ingresos',
      description: 'Analiza las ventas de membresías y los ingresos generados',
      icon: '💰',
      color: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-l-4 border-green-500',
      path: '/admin-gym/reports/income',
    },
    {
      title: 'Reporte de Asistencias',
      description: 'Revisa las asistencias y horas pico del gimnasio',
      icon: '📅',
      color: 'bg-blue-50 hover:bg-blue-100',
      borderColor: 'border-l-4 border-blue-500',
      path: '/admin-gym/reports/attendance',
    },
    {
      title: 'Reporte de Members',
      description: 'Visualiza el crecimiento y distribución de miembros',
      icon: '👥',
      color: 'bg-purple-50 hover:bg-purple-100',
      borderColor: 'border-l-4 border-purple-500',
      path: '/admin-gym/reports/members',
    },
  ];

  return (
    <AdminGymLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            📊 Reportes
          </h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            Analiza el rendimiento y estadísticas de tu gimnasio
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {reportCards.map((report, index) => (
            <Link key={index} to={report.path}>
              <Card
                className={`${report.color} ${report.borderColor} cursor-pointer transition-all duration-200 hover:shadow-lg`}
              >
                <div className="p-2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl lg:text-5xl">{report.icon}</div>
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-700">
                    Ver reporte
                    <svg
                      className="w-4 h-4 ml-2"
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
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-2xl mr-3">ℹ️</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">
                Sobre los reportes
              </h4>
              <p className="text-sm text-gray-600">
                Todos los reportes permiten filtrar por rango de fechas. Los datos se actualizan en tiempo real y reflejan el estado actual de tu gimnasio.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminGymLayout>
  );
};
