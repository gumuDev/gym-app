import { useTable, useNavigation } from '@refinedev/core';
import { SuperAdminLayout } from '../../../components/layout/SuperAdminLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Gym {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  is_active: boolean;
  trial_ends_at: string;
  created_at: string;
}

export const GymsList = () => {
  const { tableQueryResult } = useTable<Gym>({
    resource: 'super-admin/gyms',
  });

  const { push } = useNavigation();

  const { data, isLoading } = tableQueryResult;

  const toggleGymStatus = async (gymId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.patch(
        `${API_URL}/super-admin/gyms/${gymId}`,
        { is_active: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      tableQueryResult.refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar gimnasio');
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
    <SuperAdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Gimnasios</h1>
          <Button onClick={() => push('/super-admin/gyms/create')}>
            <span className="hidden sm:inline">+ Crear Gimnasio</span>
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
                        Propietario
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Teléfono
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Trial Termina
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((gym) => (
                      <tr key={gym.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{gym.name}</p>
                            <p className="text-sm text-gray-500">/{gym.slug}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{gym.owner_name}</td>
                        <td className="py-3 px-4 text-gray-700">{gym.owner_email}</td>
                        <td className="py-3 px-4 text-gray-700">{gym.phone}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              gym.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {gym.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatDate(gym.trial_ends_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => push(`/super-admin/gyms/show/${gym.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => push(`/super-admin/gyms/edit/${gym.id}`)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleGymStatus(gym.id, gym.is_active)}
                              className={`text-sm font-medium ${
                                gym.is_active
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {gym.is_active ? 'Desactivar' : 'Activar'}
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
                {data.data.map((gym) => (
                  <div key={gym.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{gym.name}</h3>
                        <p className="text-sm text-gray-500">/{gym.slug}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gym.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {gym.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      <p><span className="text-gray-500">Propietario:</span> {gym.owner_name}</p>
                      <p className="truncate"><span className="text-gray-500">Email:</span> {gym.owner_email}</p>
                      <p><span className="text-gray-500">Teléfono:</span> {gym.phone}</p>
                      <p><span className="text-gray-500">Trial:</span> {formatDate(gym.trial_ends_at)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => push(`/super-admin/gyms/show/${gym.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => push(`/super-admin/gyms/edit/${gym.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleGymStatus(gym.id, gym.is_active)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${
                          gym.is_active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {gym.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm lg:text-base">No hay gimnasios registrados</p>
              <Button onClick={() => push('/super-admin/gyms/create')}>
                Crear Primer Gimnasio
              </Button>
            </div>
          )}
        </Card>
      </div>
    </SuperAdminLayout>
  );
};
