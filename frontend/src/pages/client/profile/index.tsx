import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClientLayout } from '../../../components/layout/ClientLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, USER_KEY, API_URL } from '../../../constants/auth';

interface Member {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
}

export const ClientProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMemberProfile();
  }, []);

  const fetchMemberProfile = async () => {
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

      const response = await axios.get(`${API_URL}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMember(response.data.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    navigate('/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !member) {
    return (
      <ClientLayout>
        <div className="p-4">
          <Card className="bg-red-50 border-l-4 border-red-500">
            <p className="text-red-800">{error || 'Error al cargar perfil'}</p>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  const age = calculateAge(member.birth_date);

  return (
    <ClientLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Mi Perfil
          </h1>
          <p className="text-sm text-gray-600">Información personal</p>
        </div>

        {/* Profile Photo */}
        <div className="mb-6 text-center">
          <div className="inline-block relative">
            {member.photo_url ? (
              <img
                src={member.photo_url}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center border-4 border-green-500">
                <span className="text-3xl font-bold text-white">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Personal Info */}
        <Card className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
            Información Personal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Nombre Completo</label>
              <p className="text-base font-semibold text-gray-900">{member.name}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Código de Cliente</label>
              <p className="text-base font-mono font-semibold text-green-600">{member.code}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Teléfono</label>
              <p className="text-base text-gray-900">{member.phone}</p>
            </div>

            {member.email && (
              <div>
                <label className="text-xs font-medium text-gray-600">Email</label>
                <p className="text-base text-gray-900">{member.email}</p>
              </div>
            )}

            {member.birth_date && (
              <div>
                <label className="text-xs font-medium text-gray-600">Fecha de Nacimiento</label>
                <p className="text-base text-gray-900">
                  {formatDate(member.birth_date)}
                  {age && <span className="text-sm text-gray-600 ml-2">({age} años)</span>}
                </p>
              </div>
            )}

            {member.address && (
              <div>
                <label className="text-xs font-medium text-gray-600">Dirección</label>
                <p className="text-base text-gray-900">{member.address}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Emergency Contact */}
        {member.emergency_contact && (
          <Card className="mb-4 bg-yellow-50 border-l-4 border-yellow-500">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
              <span className="text-lg mr-2">🚨</span>
              Contacto de Emergencia
            </h3>
            <p className="text-sm text-yellow-800">{member.emergency_contact}</p>
          </Card>
        )}

        {/* Membership Info */}
        <Card className="mb-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Información de Membresía
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Miembro desde</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatDate(member.created_at)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Estado</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                member.is_active
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {member.is_active ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </Card>

        {/* Help Card */}
        <Card className="mb-4 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <span className="text-lg mr-2">ℹ️</span>
            ¿Necesitas actualizar tus datos?
          </h3>
          <p className="text-sm text-blue-800">
            Acércate a recepción para solicitar cambios en tu información personal.
          </p>
        </Card>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="danger"
            className="w-full py-3 text-lg"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
};
