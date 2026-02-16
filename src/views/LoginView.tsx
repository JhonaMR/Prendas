import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin, onRegister }) => {
    const [isRegister, setIsRegister] = useState(false);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // ========== REGISTRO ==========
        
        // Validar formato de loginCode (3 letras)
        if (code.length !== 3 || !/^[A-Za-z]{3}$/.test(code)) {
          setError('El código debe tener exactamente 3 letras');
          setLoading(false);
          return;
        }

        // Validar formato de PIN (4 dígitos)
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          setError('El PIN debe tener exactamente 4 números');
          setLoading(false);
          return;
        }

        // Validar nombre
        if (!name || name.length < 3) {
          setError('El nombre debe tener al menos 3 caracteres');
          setLoading(false);
          return;
        }

        // Llamar al backend para registrar
        const response = await api.register(name, code, pin);

        if (response.success && response.data) {
          // Registro exitoso, el api.register ya hizo login automático
          onLogin(response.data.user);
        } else {
          setError(response.message || 'Error al registrar usuario');
        }

      } else {
        // ========== LOGIN ==========

        // Validar formato de loginCode
        if (code.length !== 3) {
          setError('El código debe tener 3 letras');
          setLoading(false);
          return;
        }

        // Validar formato de PIN
        if (pin.length !== 4) {
          setError('El PIN debe tener 4 números');
          setLoading(false);
          return;
        }

        // Llamar al backend para login
        const response = await api.login(code, pin);

        if (response.success && response.data) {
          // Login exitoso
          onLogin(response.data.user);
        } else {
          setError(response.message || 'Credenciales inválidas');
        }
      }

    } catch (error) {
      console.error('Error en autenticación:', error);
      setError('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 py-8">
        <div className="bg-white p-8 sm:p-4 rounded-[40px] sm:rounded-[48px] shadow-2xl border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <div className="text-center mb-.1 relative z-10">
            <div className="w-20 h-20 sm:w-32 sm:h-24 bg-gradient-to-br from-blue-500 to-pink-500 rounded-[24px] sm:rounded-[32px] mx-auto flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-2xl shadow-blue-200 mb-6">
              PLOW
            </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isRegister ? 'Registra tu usuario nuevo' : 'Gestion de inventario'}
          </p>
      </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre (solo en registro) */}
            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                  disabled={loading}
                  required={isRegister}
                />
              </div>
            )}

            {/* Login Code */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Login (3 Letras)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="AAA"
                maxLength={3}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700 font-bold text-center text-2xl tracking-widest placeholder:text-slate-400 uppercase"
                disabled={loading}
                required
              />
              <p className="text-xs text-slate-400 mt-1 text-center font-medium">
                3 letras únicas
              </p>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                PIN (4 Números)
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                maxLength={4}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-slate-700 font-bold text-center text-2xl tracking-widest"
                disabled={loading}
                required
              />
              <p className="text-xs text-slate-400 mt-1 text-center font-medium">
                4 dígitos numéricos
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-sm font-bold text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black text-lg shadow-2xl shadow-blue-300/50 hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Ingresar')}
            </button>

            {/* Toggle Register/Login */}
            <div className="text-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setCode('');
                  setPin('');
                  setName('');
                }}
                className="text-slate-600 font-bold hover:text-blue-600 transition-colors text-sm"
                disabled={loading}
              >
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginView;
