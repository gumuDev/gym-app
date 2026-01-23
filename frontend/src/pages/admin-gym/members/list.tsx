import { useTable, useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Member {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    memberships: number;
  };
}

export const MembersList = () => {
  const { tableQueryResult } = useTable<Member>({
    resource: 'members',
  });

  const { push } = useNavigation();

  const { data, isLoading } = tableQueryResult;

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      await axios.patch(
        `${API_URL}/members/${memberId}`,
        { is_active: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      tableQueryResult.refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar miembro');
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Miembros</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data?.total || 0} miembros registrados
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/members/create')}>
            <span className="hidden sm:inline">+ Registrar Miembro</span>
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
                        Código
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Contacto
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Registrado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium text-blue-600">
                            {member.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{member.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {member.email && (
                              <p className="text-gray-700">{member.email}</p>
                            )}
                            <p className="text-gray-500">{member.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {member.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {formatDate(member.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => push(`/admin-gym/members/show/${member.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => push(`/admin-gym/members/edit/${member.id}`)}
                              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleMemberStatus(member.id, member.is_active)}
                              className={`text-sm font-medium ${
                                member.is_active
                                  ? 'text-red-600 hover:text-red-800'
                                  : 'text-green-600 hover:text-green-800'
                              }`}
                            >
                              {member.is_active ? 'Desactivar' : 'Activar'}
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
                {data.data.map((member) => (
                  <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{member.name}</h3>
                        <p className="text-sm font-mono text-blue-600">{member.code}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          member.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {member.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      {member.email && (
                        <p className="truncate">
                          <span className="text-gray-500">Email:</span> {member.email}
                        </p>
                      )}
                      <p>
                        <span className="text-gray-500">Teléfono:</span> {member.phone}
                      </p>
                      <p>
                        <span className="text-gray-500">Registrado:</span>{' '}
                        {formatDate(member.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => push(`/admin-gym/members/show/${member.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Ver QR
                      </button>
                      <button
                        onClick={() => push(`/admin-gym/members/edit/${member.id}`)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleMemberStatus(member.id, member.is_active)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg ${
                          member.is_active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {member.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-sm lg:text-base">
                No hay miembros registrados
              </p>
              <Button onClick={() => push('/admin-gym/members/create')}>
                Registrar Primer Miembro
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminGymLayout>
  );
};
