import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showError, showSuccess } from '../../../utils/notification';
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

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export const MembersList = () => {
  const { push } = useNavigation();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false,
  });

  // Fetch members
  const fetchMembers = async (page: number = 1, searchTerm: string = search) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem(TOKEN_KEY);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${API_URL}/members?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMembers(response.data.data.data);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al cargar miembros');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchMembers(1, searchInput);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchMembers(newPage);
  };

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
      showSuccess(`Miembro ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      fetchMembers(pagination.page);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Error al actualizar miembro');
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
              {pagination.total} miembros registrados
            </p>
          </div>
          <Button onClick={() => push('/admin-gym/members/create')}>
            <span className="hidden sm:inline">+ Registrar Miembro</span>
            <span className="sm:hidden">+ Crear</span>
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por nombre, email, teléfono o código..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit">
              🔍 Buscar
            </Button>
            {search && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  fetchMembers(1, '');
                }}
              >
                Limpiar
              </Button>
            )}
          </form>
        </div>

        <Card>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          ) : members && members.length > 0 ? (
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
                    {members.map((member) => (
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
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver QR"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => push(`/admin-gym/members/edit/${member.id}`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleMemberStatus(member.id, member.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                member.is_active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={member.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {member.is_active ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
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
                {members.map((member) => (
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

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} miembros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevious}
                    >
                      ← Anterior
                    </Button>

                    {/* Números de página */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              pagination.page === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasMore}
                    >
                      Siguiente →
                    </Button>
                  </div>
                </div>
              )}
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
