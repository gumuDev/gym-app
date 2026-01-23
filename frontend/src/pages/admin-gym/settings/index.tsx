import { useState, useEffect } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';

interface Gym {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  telegram_bot_token?: string;
  setup_completed: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  telegram_bot_token: string;
}

export const Settings = () => {
  const { push } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [gym, setGym] = useState<Gym | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'telegram'>('info');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    telegram_bot_token: '',
  });

  useEffect(() => {
    fetchGym();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGym = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/gyms/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const gymData = response.data.data;
      setGym(gymData);

      // Set form data
      setFormData({
        name: gymData.name || '',
        email: gymData.email || '',
        phone: gymData.phone || '',
        address: gymData.address || '',
        telegram_bot_token: gymData.telegram_bot_token || '',
      });
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al cargar la configuración del gimnasio: ${errorMessage}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const payload: Record<string, string> = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.phone) payload.phone = formData.phone;
      if (formData.address) payload.address = formData.address;
      if (formData.telegram_bot_token) payload.telegram_bot_token = formData.telegram_bot_token;

      const response = await axios.patch(`${API_URL}/gyms/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedGym = response.data.data;
      setGym(updatedGym);

      alert('✅ Configuración actualizada exitosamente');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar la configuración';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <AdminGymLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </AdminGymLayout>
    );
  }

  if (!gym) {
    return (
      <AdminGymLayout>
        <Card>
          <p className="text-gray-500">No se pudo cargar la configuración</p>
        </Card>
      </AdminGymLayout>
    );
  }

  return (
    <AdminGymLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Configuración
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                Gestiona la información de tu gimnasio
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => push('/admin-gym/dashboard')}
              className="hidden lg:inline-flex"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('telegram')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'telegram'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Telegram Bot
            </button>
          </div>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Información Básica */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Información Básica
                </h2>
                <div className="space-y-4">
                  {/* Slug (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identificador (Slug)
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                      {gym.slug}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Este identificador no se puede modificar
                    </p>
                  </div>

                  {/* Nombre */}
                  <Input
                    label="Nombre del Gimnasio"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                    required
                    placeholder="Gym Olimpo"
                  />

                  {/* Email */}
                  <Input
                    label="Email de Contacto"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    required
                    placeholder="contacto@gimnasio.com"
                  />

                  {/* Teléfono */}
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+591 12345678"
                  />

                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Calle 123, Zona Sur, Ciudad..."
                    />
                  </div>
                </div>
              </Card>

              {/* Información del Sistema */}
              <Card className="border-l-4 border-blue-500 bg-blue-50">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Información del Sistema
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="font-medium">
                      {gym.setup_completed ? 'Configurado ✓' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha de Creación:</span>
                    <span className="font-medium">
                      {new Date(gym.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-initial">
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => push('/admin-gym/dashboard')}
                  disabled={loading}
                  className="flex-1 sm:flex-initial lg:hidden"
                >
                  Volver
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Telegram Tab */}
        {activeTab === 'telegram' && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Configuración de Telegram Bot
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Conecta un bot de Telegram para enviar notificaciones automáticas a tus
                  clientes sobre vencimiento de membresías.
                </p>

                <Input
                  label="Token del Bot"
                  type="text"
                  value={formData.telegram_bot_token}
                  onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  helperText="Obtén tu token hablando con @BotFather en Telegram"
                />

                {formData.telegram_bot_token && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      ✅ Bot Configurado
                    </p>
                    <p className="text-sm text-green-700">
                      El bot está listo para enviar notificaciones. Los clientes pueden
                      activar las notificaciones hablando con tu bot.
                    </p>
                  </div>
                )}
              </Card>

              {/* Instrucciones */}
              <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                <h3 className="text-sm font-semibold text-yellow-900 mb-3">
                  📝 Cómo configurar tu bot
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                  <li>Abre Telegram y busca @BotFather</li>
                  <li>Envía el comando /newbot</li>
                  <li>Sigue las instrucciones para crear tu bot</li>
                  <li>Copia el token que te da BotFather</li>
                  <li>Pégalo en el campo de arriba y guarda</li>
                </ol>
              </Card>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" loading={loading} className="flex-1 sm:flex-initial">
                  Guardar Configuración
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => push('/admin-gym/dashboard')}
                  disabled={loading}
                  className="flex-1 sm:flex-initial lg:hidden"
                >
                  Volver
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminGymLayout>
  );
};
