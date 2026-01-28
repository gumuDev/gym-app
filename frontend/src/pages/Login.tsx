import { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login = () => {
  const navigate = useNavigate();
  const { mutate: login, isLoading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    await login(
      { email, password },
      {
        onSuccess: (data) => {
           if (!data.success) setError(data?.error?.message || 'Error al iniciar session');
        },
        onError: (error: any) => {
          setError(error?.message || 'Error al iniciar sesión');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          GymApp
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gymapp.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/client/login')}
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            ¿Eres cliente? Ingresa aquí →
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Credenciales de prueba:
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p className="text-center">
              <strong>Super Admin:</strong> admin@gymapp.com
            </p>
            <p className="text-center">
              <strong>Gym Admin:</strong> admin@gimolimp.com
            </p>
            <p className="text-center">
              <strong>Password:</strong> admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
