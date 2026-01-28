import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
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
  address: string;
  is_active: boolean;
  trial_ends_at: string;
  created_at: string;
}

export const GymsShow = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get<{ data: Gym }>(
          `${API_URL}/super-admin/gyms/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGym(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar gimnasio');
      } finally {
        setLoading(false);
      }
    };

    fetchGym();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  if (error || !gym) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Gimnasio no encontrado'}</p>
          <Button onClick={() => push('/super-admin/gyms')}>
            Volver a Lista
          </Button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{gym.name}</h1>
            <p className="text-gray-500 mt-1">/{gym.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => push(`/super-admin/gyms/edit/${gym.id}`)}
            >
              Editar
            </Button>
            <Button
              variant="secondary"
              onClick={() => push('/super-admin/gyms')}
            >
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Información General">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-gray-800 mt-1">{gym.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Slug</p>
                <p className="text-gray-800 mt-1">/{gym.slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dirección</p>
                <p className="text-gray-800 mt-1">{gym.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                <p className="text-gray-800 mt-1">{gym.phone}</p>
              </div>
            </div>
          </Card>

          <Card title="Propietario">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nombre</p>
                <p className="text-gray-800 mt-1">{gym.owner_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-800 mt-1">{gym.owner_email}</p>
              </div>
            </div>
          </Card>

          <Card title="Estado">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estado Actual</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                    gym.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {gym.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trial Termina</p>
                <p className="text-gray-800 mt-1">{formatDate(gym.trial_ends_at)}</p>
              </div>
            </div>
          </Card>

          <Card title="Fechas">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                <p className="text-gray-800 mt-1">{formatDate(gym.created_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};
