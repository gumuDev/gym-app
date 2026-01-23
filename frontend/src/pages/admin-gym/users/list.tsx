import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'TRAINER';
  is_active: boolean;
  created_at: string;
}

export const UsersList = () => {
  const { push } = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setUsers(data);
    } catch (error: any) {
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de ${action} este usuario?`;

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (currentStatus) {
        // Desactivar
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Activar
        await axios.post(
          `${API_URL}/users/${userId}/activate`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      // Recargar lista
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Error al ${action} usuario`;
      alert(errorMessage);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-purple-100 text-purple-800',
      RECEPTIONIST: 'bg-blue-100 text-blue-800',
      TRAINER: 'bg-green-100 text-green-800',
    };
    const labels = {
      ADMIN: 'Administrador',
      RECEPTIONIST: 'Recepcionista',
      TRAINER: 'Entrenador',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          badges[role as keyof typeof badges]
        }`}
      >
        {labels[role as keyof typeof labels]}
      </span>
    );
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

  // Separar usuarios por rol
  const adminUsers = users.filter((u) => u.role === 'ADMIN');
  const otherUsers = users.filter((u) => u.role !== 'ADMIN');

  return (
    <AdminGymLayout>
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Usuarios</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              Gestiona el equipo de tu gimnasio
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/users/create')}>+ Nuevo Usuario</Button>
        </div>
      </div>

      {/* Administradores */}
      {adminUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Administradores</h2>
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </td>
                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(user.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Vista Mobile - Admin */}
          <div className="lg:hidden space-y-4">
            {adminUsers.map((user) => (
              <Card key={user.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(user.created_at)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Otros Usuarios (Recepcionistas y Entrenadores) */}
      {otherUsers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No hay recepcionistas ni entrenadores registrados
            </p>
            <Button onClick={() => push('/admin-gym/users/create')}>
              Crear Primer Usuario
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Equipo</h2>

          {/* Vista Desktop - Tabla */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {otherUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </td>
                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(user.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => push(`/admin-gym/users/edit/${user.id}`)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleToggleStatus(user.id, user.is_active)}
                            >
                              {user.is_active ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
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
            {otherUsers.map((user) => (
              <Card key={user.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado:</span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Creado:</span>
                    <span className="text-gray-900">{formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => push(`/admin-gym/users/edit/${user.id}`)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                    className="flex-1"
                  >
                    {user.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </AdminGymLayout>
  );
};
