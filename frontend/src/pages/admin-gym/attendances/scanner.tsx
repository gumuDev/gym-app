import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@refinedev/core';
import { AdminGymLayout } from '../../../components/layout/AdminGymLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TOKEN_KEY, API_URL } from '../../../constants/auth';
import { showSuccess, showWarning } from '../../../utils/notification';
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
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = () => {
    // Set scanning to true first, then start scanner in useEffect
    setCameraError('');
    setError('');
    setScanResult(null);
    setScanning(true);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        // Check if scanner is running before stopping
        const state = scannerRef.current.getState();
        if (state === 2) { // 2 = SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanner immediately
    await stopScanner();

    // Process the scanned code
    await handleCodeScanned(decodedText);
  };

  const onScanFailure = (_error: any) => {
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

      showSuccess(`✅ Asistencia registrada para ${scanResult.member.name}`);

      // Reset and start scanning again
      setScanResult(null);
      await startScanner();
    } catch (error: any) {
      // Handle duplicate attendance (409)
      if (error.response?.status === 409 && error.response?.data?.alreadyRegistered) {
        const registeredAt = new Date(error.response.data.registeredAt);
        const timeString = registeredAt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });

        showWarning(
          `⚠️ ${scanResult.member.name} ya registró asistencia hoy a las ${timeString}`
        );

        // Reset and start scanning again
        setScanResult(null);
        if (scanMode === 'camera') {
          await startScanner();
        }
        return;
      }

      // Handle other errors
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || 'Error al registrar asistencia';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setScanResult(null);
    setError('');
    if (scanMode === 'camera') {
      await startScanner();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-file');
      const decodedText = await html5QrCode.scanFile(file, true);

      // Process the scanned code
      await handleCodeScanned(decodedText);

      // Clear the html5QrCode instance
      html5QrCode.clear();
    } catch (err: any) {
      console.error('Error decoding QR from image:', err);
      setError('No se pudo leer el código QR de la imagen. Asegúrate de que sea una imagen clara del código.');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleModeChange = async (mode: 'camera' | 'upload') => {
    // Stop scanner if switching modes
    if (scanning) {
      await stopScanner();
    }
    setScanMode(mode);
    setError('');
    setCameraError('');
    setScanResult(null);
  };

  // Initialize scanner when scanning becomes true
  useEffect(() => {
    const initScanner = async () => {
      if (scanning && !scannerRef.current) {
        try {
          // Wait a bit for DOM to be ready
          await new Promise(resolve => setTimeout(resolve, 100));

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
        } catch (err: any) {
          console.error('Error starting scanner:', err);
          setCameraError(
            'No se pudo acceder a la cámara. Verifica los permisos del navegador.'
          );
          setScanning(false);
        }
      }
    };

    initScanner();
  }, [scanning]);

  // Cleanup on unmount or when navigating away
  useEffect(() => {
    return () => {
      // Force stop scanner on unmount
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) { // 2 = SCANNING state
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.error('Error cleaning up scanner:', err);
        }
      }
    };
  }, []);

  // Stop scanner when changing modes
  useEffect(() => {
    if (scanMode === 'upload' && scannerRef.current) {
      stopScanner();
    }
  }, [scanMode]);

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

        {/* Mode Tabs */}
        {!scanResult && (
          <Card className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleModeChange('camera')}
                disabled={scanning}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  scanMode === 'camera'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                } ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                📷 {scanning ? 'Escaneando...' : 'Escanear con Cámara'}
              </button>
              <button
                onClick={() => handleModeChange('upload')}
                disabled={scanning}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  scanMode === 'upload'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                } ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🖼️ Subir Imagen
              </button>
            </div>
          </Card>
        )}

        {/* Scanner Area - Camera Mode */}
        {scanMode === 'camera' && !scanResult && (
          <Card>
            <div className="text-center">
              {/* Initial state - before scanning */}
              {!scanning && (
                <div className="py-12">
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
              )}

              {/* Scanning state - header with stop button */}
              {scanning && (
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4 px-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Apunta la cámara al código QR
                    </h2>
                    <Button
                      variant="secondary"
                      onClick={stopScanner}
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                    >
                      ⏹ Detener
                    </Button>
                  </div>

                  {/* QR Reader container - ALWAYS in DOM when camera mode is active */}
                  <div id="qr-reader" className="mx-auto"></div>

                  {/* Bottom stop button */}
                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      onClick={stopScanner}
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                    >
                      ⏹ Detener Cámara
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Scanner Area - Upload Mode */}
        {scanMode === 'upload' && !scanning && !scanResult && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🖼️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Subir Imagen del QR
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona una imagen que contenga el código QR del cliente
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-file-input"
              />

              {/* Hidden div for scanFile */}
              <div id="qr-reader-file" className="hidden"></div>

              <label
                htmlFor="qr-file-input"
                className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-lg cursor-pointer ${
                  loading
                    ? 'bg-blue-600 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Seleccionar Imagen'
                )}
              </label>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
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
