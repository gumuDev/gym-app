import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
}

interface Membership {
  id: string;
  discipline: { name: string };
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
}

interface ScanResult {
  member: Member;
  activeMemberships: Membership[];
  daysRemaining?: number;
}

export const AttendancesScanner = () => {
  const { push } = useNavigation();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  const startScanner = async () => {
    try {
      setCameraError('');
      setError('');
      setScanResult(null);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Verifica los permisos del navegador.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanner immediately
    await stopScanner();

    // Process the scanned code
    await handleCodeScanned(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Ignore scan failures (happens constantly while scanning)
  };

  const handleCodeScanned = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      // Get member info by code
      const memberResponse = await axios.get(`${API_URL}/members/code/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const member = memberResponse.data.data;

      // Get member's active memberships
      const membershipsResponse = await axios.get(
        `${API_URL}/memberships/member/${member.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const memberships = membershipsResponse.data.data || [];
      const activeMemberships = memberships.filter(
        (m: Membership) => m.status === 'ACTIVE'
      );

      // Calculate days remaining for first active membership
      let daysRemaining: number | undefined;
      if (activeMemberships.length > 0) {
        const endDate = new Date(activeMemberships[0].end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      setScanResult({
        member,
        activeMemberships,
        daysRemaining,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Código no encontrado o inválido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAttendance = async () => {
    if (!scanResult) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      await axios.post(
        `${API_URL}/attendances`,
        {
          member_code: scanResult.member.code,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`✅ Asistencia registrada para ${scanResult.member.name}`);

      // Reset and start scanning again
      setScanResult(null);
      await startScanner();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al registrar asistencia';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setScanResult(null);
    setError('');
    await startScanner();
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AdminGymLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Escanear QR
              </h1>
              <p className="text-sm lg:text-base text-gray-500 mt-1">
                Registra asistencias escaneando el código QR
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => push('/admin-gym/attendances')}
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Scanner Area */}
        {!scanning && !scanResult && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Escanear Código QR
              </h2>
              <p className="text-gray-600 mb-6">
                Activa la cámara para escanear el código QR del cliente
              </p>
              {cameraError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{cameraError}</p>
                </div>
              )}
              <Button onClick={startScanner}>Activar Cámara</Button>
            </div>
          </Card>
        )}

        {/* Camera View */}
        {scanning && (
          <Card>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Apunta la cámara al código QR
              </h2>
              <div
                id="qr-reader"
                className="mx-auto max-w-md rounded-lg overflow-hidden"
              ></div>
              <div className="mt-6">
                <Button variant="secondary" onClick={stopScanner}>
                  Detener Escaneo
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Scan Result */}
        {scanResult && !scanning && (
          <div className="space-y-4">
            {/* Member Info */}
            <Card className="border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <div className="text-4xl">👤</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {scanResult.member.name}
                  </h2>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Código:</span>{' '}
                      {scanResult.member.code}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Teléfono:</span>{' '}
                      {scanResult.member.phone}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Membership Status */}
            {scanResult.activeMemberships.length > 0 ? (
              <Card className="border-l-4 border-green-500 bg-green-50">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Membresía Activa
                    </h3>
                    {scanResult.activeMemberships.map((membership) => (
                      <div key={membership.id} className="text-sm text-green-800 space-y-1">
                        <p>
                          <span className="font-medium">Disciplina:</span>{' '}
                          {membership.discipline.name}
                        </p>
                        <p>
                          <span className="font-medium">Vencimiento:</span>{' '}
                          {formatDate(membership.end_date)}
                        </p>
                        {scanResult.daysRemaining !== undefined && (
                          <p
                            className={`font-semibold ${
                              scanResult.daysRemaining <= 7
                                ? 'text-yellow-700'
                                : 'text-green-800'
                            }`}
                          >
                            {scanResult.daysRemaining > 0
                              ? `${scanResult.daysRemaining} días restantes`
                              : scanResult.daysRemaining === 0
                              ? 'Vence hoy'
                              : 'Membresía vencida'}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Warning if expiring soon */}
                    {scanResult.daysRemaining !== undefined &&
                      scanResult.daysRemaining <= 7 &&
                      scanResult.daysRemaining > 0 && (
                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                          <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Membresía por vencer. Recordar al cliente renovar.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-l-4 border-red-500 bg-red-50">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">❌</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Sin Membresía Activa
                    </h3>
                    <p className="text-sm text-red-800">
                      Este cliente no tiene membresías activas. Registra una nueva
                      membresía para permitir el acceso.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="border-l-4 border-red-500 bg-red-50">
                <p className="text-sm text-red-800">{error}</p>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {scanResult.activeMemberships.length > 0 ? (
                <Button
                  onClick={handleConfirmAttendance}
                  loading={loading}
                  className="flex-1"
                >
                  ✓ Registrar Asistencia
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    push(`/admin-gym/members/show/${scanResult.member.id}`)
                  }
                  className="flex-1"
                >
                  Ver Cliente
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                Escanear Otro
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminGymLayout>
  );
};
