import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '@/services/authService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setLoading(true);

      // 1️⃣ login → tokens
      await authService.login(email, password);

      // 2️⃣ buscar usuário
      const user = await authService.me();

      // 3️⃣ salvar no contexto
      login(user);

      // 4️⃣ decidir rota
      if (user.role === 'ADMIN') {
        navigate({ to: '/admin/dashboard' });
      } else {
        navigate({ to: '/seller/pos' });
      }

    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Falha no login');
      } else {
        setError(err.message || 'Falha no login');
      }
    }
    finally {
      setLoading(false);
    }

  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Bem-vindo</h2>
        <p className="mt-2 text-sm text-gray-600">Acesse o sistema GTA - Tech</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="ex: admin@gtatech.com"
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••"
        />

        <Button type="submit" className="w-full py-3" isLoading={loading}>
          Entrar no Sistema
        </Button>
      </form>

      {/* <div className="mt-6 text-center text-xs text-gray-500">
        <p>Credenciais de Teste:</p>
        <p>Admin: admin@gtatech.com / 123</p>
        <p>Vendedor: vendedor@gtatech.com / 123</p>
      </div> */}
    </div>
  );
};
