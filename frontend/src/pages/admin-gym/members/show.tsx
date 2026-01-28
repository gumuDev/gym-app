import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';
import QRCode from 'react-qr-code';

interface Member {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string;
  birth_date: string | null;
  address: string | null;
  emergency_contact: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    memberships: number;
    attendances: number;
  };
}

export const MembersShow = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useNavigation();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const response = await axios.get(`${API_URL}/members/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMember(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar miembro');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${member?.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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

  if (error || !member) {
    return (
      <AdminGymLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500">{error || 'Miembro no encontrado'}</p>
          <Button onClick={() => push('/admin-gym/members')}>Volver a Miembros</Button>
        </div>
      </AdminGymLayout>
    );
  }

  return (
    <AdminGymLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{member.name}</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              Código: <span className="font-mono font-semibold">{member.code}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => push(`/admin-gym/members/edit/${member.id}`)}
              className="flex-1 sm:flex-none"
            >
              Editar
            </Button>
            <Button
              variant="secondary"
              onClick={() => push('/admin-gym/members')}
              className="flex-1 sm:flex-none"
            >
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code */}
          <Card title="Código QR" className="lg:col-span-1">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCode
                  id="qr-code"
                  value={member.code}
                  size={200}
                  level="H"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                Escanea este código para registrar asistencia
              </p>
              <Button onClick={downloadQR} variant="secondary" className="w-full">
                Descargar QR
              </Button>
            </div>
          </Card>

          {/* Información Personal */}
          <Card title="Información Personal" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <p className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      member.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {member.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="mt-1 text-gray-800">{member.phone}</p>
              </div>

              {member.email && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-800">{member.email}</p>
                </div>
              )}

              {member.birth_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Nacimiento
                  </label>
                  <p className="mt-1 text-gray-800">{formatDate(member.birth_date)}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                <p className="mt-1 text-gray-800">{formatDate(member.created_at)}</p>
              </div>

              {member.address && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="mt-1 text-gray-800">{member.address}</p>
                </div>
              )}

              {member.emergency_contact && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Contacto de Emergencia
                  </label>
                  <p className="mt-1 text-gray-800">{member.emergency_contact}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Estadísticas */}
          <Card title="Estadísticas" className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {member._count?.memberships || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Membresías</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {member._count?.attendances || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Asistencias</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">-</p>
                <p className="text-sm text-gray-600 mt-1">Última Asistencia</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-gray-600 mt-1">Días Activo</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminGymLayout>
  );
};
