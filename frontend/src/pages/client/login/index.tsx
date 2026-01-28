import { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ClientLogin = () => {
  const { mutate: login, isLoading } = useLogin();
  const [loginMethod, setLoginMethod] = useState<'code' | 'phone'>('code');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMethod === 'code') {
      if (!code.trim()) {
        setError('Por favor ingresa tu código');
        return;
      }
      login(
        { code: code.trim(), type: 'member' },
        {
          onError: (error: any) => {
            setError(error?.message || 'Código inválido');
          },
        }
      );
    } else {
      if (!phone.trim()) {
        setError('Por favor ingresa tu teléfono');
        return;
      }
      login(
        { phone: phone.trim(), type: 'member' },
        {
          onError: (error: any) => {
            setError(error?.message || 'Teléfono no encontrado');
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-white mb-2">Mi Gym</h1>
          <p className="text-green-100">Acceso para Clientes</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Toggle Login Method */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setLoginMethod('code');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'code'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Con Código
            </button>
            <button
              onClick={() => {
                setLoginMethod('phone');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Con Teléfono
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === 'code' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Cliente
                </label>
                <Input
                  type="text"
                  placeholder="GYM-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ingresa el código que aparece en tu QR
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Teléfono
                </label>
                <Input
                  type="tel"
                  placeholder="Ej: 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-center text-lg"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ingresa el teléfono registrado en el gym
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              Ingresar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ¿Problemas para ingresar?{' '}
              <span className="text-green-600 font-medium">
                Consulta en recepción
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-green-100 text-sm">
          <p>© 2026 GymApp - Sistema de Gestión</p>
        </div>
      </div>
    </div>
  );
};
