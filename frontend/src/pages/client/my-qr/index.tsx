import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { ClientLayout } from '../../../components/layout/ClientLayout';
import { Card } from '../../../components/ui/Card';
import { USER_KEY } from '../../../constants/auth';

interface UserData {
  id: string;
  name: string;
  code: string;
  role: string;
}

export const ClientMyQR = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);

  if (!user) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="p-4 sm:p-6">
        {/* QR Code Card */}
        <Card className="bg-white">
          <div className="text-center">
            {/* Member Name */}
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {user.name}
              </h2>
              <p className="text-lg text-green-600 font-mono font-semibold tracking-wide">
                {user.code}
              </p>
            </div>

            {/* QR Code - Extra grande para fácil escaneo */}
            <div className="flex justify-center mb-4 bg-white p-6 rounded-xl">
              <QRCode
                value={user.code}
                size={280}
                level="H"
              />
            </div>

            {/* Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                📱 Muestra este código en recepción
              </p>
              <p className="text-xs text-green-700 mt-1">
                El recepcionista escaneará este código para registrar tu
                asistencia
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
};
