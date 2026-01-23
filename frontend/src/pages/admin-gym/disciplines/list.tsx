import { useTable, useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Discipline {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    pricing_plans: number;
    memberships: number;
  };
}

export const DisciplinesList = () => {
  const { tableQueryResult } = useTable<Discipline>({
    resource: 'disciplines',
  });

  const { push } = useNavigation();

  const { data, isLoading } = tableQueryResult;

  const toggleDisciplineStatus = async (disciplineId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.patch(
        `${API_URL}/disciplines/${disciplineId}`,
        { is_active: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      tableQueryResult.refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar disciplina');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminGymLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Disciplinas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data?.total || 0} disciplinas registradas
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/disciplines/create')}>
            <span className="hidden sm:inline">+ Crear Disciplina</span>
            <span className="sm:hidden">+ Crear</span>
          </Button>
        </div>

        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Descripción
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Planes
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Miembros
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Creada
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((discipline) => (
                      <tr key={discipline.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{discipline.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {discipline.description || 'Sin descripción'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {discipline._count?.pricing_plans || 0} planes
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                            {discipline._count?.memberships || 0} activos
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              discipline.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {discipline.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {formatDate(discipline.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => push(`/admin-gym/disciplines/edit/${discipline.id}`)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleDisciplineStatus(discipline.id, discipline.is_active)}
                              className={`text-sm font-medium ${
                                discipline.is_active
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {discipline.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="lg:hidden space-y-4">
                {data.data.map((discipline) => (
                  <div key={discipline.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{discipline.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {discipline.description || 'Sin descripción'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          discipline.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {discipline.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-3 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        {discipline._count?.pricing_plans || 0} planes
                      </span>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                        {discipline._count?.memberships || 0} miembros
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Creada: {formatDate(discipline.created_at)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => push(`/admin-gym/disciplines/edit/${discipline.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleDisciplineStatus(discipline.id, discipline.is_active)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${
                          discipline.is_active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {discipline.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm lg:text-base">
                No hay disciplinas registradas
              </p>
              <Button onClick={() => push('/admin-gym/disciplines/create')}>
                Crear Primera Disciplina
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminGymLayout>
  );
};
