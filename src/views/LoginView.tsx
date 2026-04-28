import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin, onRegister }) => {
  const { isDark } = useDarkMode();
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

        // Validar formato de PIN (4 dígitosy
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
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-colors duration-300 ${
      isDark ? 'bg-[#3d2d52]' : 'bg-slate-50'
    }`}>
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 py-8">
        <div className={`p-8 sm:p-4 rounded-[40px] sm:rounded-[48px] shadow-2xl border relative overflow-hidden transition-colors duration-300 ${
          isDark 
            ? 'bg-[#4a3a63] border-violet-700' 
            : 'bg-white border-white'
        }`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl ${
            isDark ? 'bg-pink-900/30' : 'bg-pink-100/50'
          }`}></div>
          <div className={`absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16 blur-3xl ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-100/50'
          }`}></div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-20 h-20 sm:w-32 sm:h-24 bg-gradient-to-br from-blue-500 to-pink-500 rounded-[24px] sm:rounded-[32px] mx-auto flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-2xl shadow-blue-200 mb-6">
              {window.BRAND_CONFIG?.name || 'Plow'}
            </div>
            <h1 className={`text-4xl font-black tracking-tight mb-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
            </h1>
            <p className={`font-medium transition-colors duration-300 ${isDark ? 'text-violet-300' : 'text-slate-500'}`}>
              {isRegister ? `Registra tu usuario nuevo en ${window.BRAND_CONFIG?.name || 'Plow'}` : `Gestión de inventario - ${window.BRAND_CONFIG?.name || 'Plow'}`}
            </p>
          </div>

          {/* Form Card */}
          <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 border transition-colors duration-300 ${
            isDark 
              ? 'bg-[#3d2d52]/80 border-violet-600 shadow-violet-900/50' 
              : 'bg-white/80 border-white/20 shadow-slate-200/50'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre (solo en registro) */}
              {isRegister && (
                <div>
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wide transition-colors duration-300 ${
                    isDark ? 'text-violet-300' : 'text-slate-700'
                  }`}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo"
                    className={`w-full px-5 py-4 rounded-2xl border-2 focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/30' 
                        : 'border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                    }`}
                    disabled={loading}
                    required={isRegister}
                  />
                </div>
              )}

              {/* Login Code */}
              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wide transition-colors duration-300 ${
                  isDark ? 'text-violet-300' : 'text-slate-700'
                }`}>
                  Login (3 Letras)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="AAA"
                  maxLength={3}
                  className={`w-full px-5 py-4 rounded-2xl border-2 focus:outline-none transition-all text-center text-2xl tracking-widest uppercase font-bold ${
                    isDark 
                      ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/30' 
                      : 'border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                  disabled={loading}
                  required
                />
                <p className={`text-xs mt-1 text-center font-medium transition-colors duration-300 ${
                  isDark ? 'text-violet-400' : 'text-slate-400'
                }`}>
                  3 letras únicas
                </p>
              </div>

              {/* PIN */}
              <div>
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wide transition-colors duration-300 ${
                  isDark ? 'text-violet-300' : 'text-slate-700'
                }`}>
                  PIN (4 Números)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  className={`w-full px-5 py-4 rounded-2xl border-2 focus:outline-none transition-all text-center text-2xl tracking-widest font-bold ${
                    isDark 
                      ? 'bg-[#3d2d52] border-violet-600 text-violet-100 placeholder-violet-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/30' 
                      : 'border-slate-200 text-slate-700 placeholder-slate-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-100'
                  }`}
                  disabled={loading}
                  required
                />
                <p className={`text-xs mt-1 text-center font-medium transition-colors duration-300 ${
                  isDark ? 'text-violet-400' : 'text-slate-400'
                }`}>
                  4 dígitos numéricos
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`border-2 rounded-2xl p-4 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-red-900/30 border-red-700' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm font-bold text-center transition-colors duration-300 ${
                    isDark ? 'text-red-300' : 'text-red-600'
                  }`}>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-2xl transition-all ${
                  isDark 
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 shadow-violet-900/50 hover:shadow-violet-900/70 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100' 
                    : 'bg-gradient-to-r from-blue-600 to-pink-600 shadow-blue-300/50 hover:shadow-blue-400/70 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                }`}
              >
                {loading ? 'Procesando...' : (isRegister ? 'Crear Cuenta' : 'Ingresar')}
              </button>

              {/* Toggle Register/Login */}
              <div className={`text-center pt-4 border-t transition-colors duration-300 ${
                isDark ? 'border-violet-600' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setCode('');
                    setPin('');
                    setName('');
                  }}
                  className={`font-bold transition-colors text-sm ${
                    isDark 
                      ? 'text-violet-300 hover:text-pink-400' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
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
