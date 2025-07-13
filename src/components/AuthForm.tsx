import React, { useState } from 'react';
import { User, Shield, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { users } from '../data/mockData';
import { User as UserType } from '../types';

interface AuthFormProps {
  onLogin: (user: UserType) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  // Estados
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'TUR001' as const
  });
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasSpecialChar: false,
    isValid: false
  });

  // Función de validación de contraseña mejorada
  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    const isValid = hasUpperCase && hasSpecialChar && password.length >= 6;
    
    setPasswordValidation({
      hasUpperCase,
      hasSpecialChar,
      isValid
    });
    
    return isValid;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    validatePassword(password);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Simulación de login
      const mockCredentials = {
        'admin@samore.cl': { user: users[0], password: 'Admin123!' },
        'turista@samore.cl': { user: users[1], password: 'Turista123!' },
        'transportista@samore.cl': { user: users[2], password: 'Trans123!' },
        'sag@samore.cl': { user: users[3], password: 'Sag123!' }
      };

      const credential = mockCredentials[formData.email as keyof typeof mockCredentials];
      if (credential && credential.password === formData.password) {
        onLogin(credential.user);
      } else {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      }
    } else {
      // Validación de registro
      if (!formData.name || !formData.email || !formData.password) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      // Validación estricta de contraseña
      if (!passwordValidation.isValid) {
        setError('La contraseña no cumple con los requisitos de seguridad');
        return;
      }

      if (!passwordValidation.hasUpperCase) {
        setError('La contraseña DEBE contener al menos una letra MAYÚSCULA');
        return;
      }

      if (!passwordValidation.hasSpecialChar) {
        setError('La contraseña DEBE contener al menos un carácter especial (!@#$%^&*...)');
        return;
      }

      // Crear usuario si pasa todas las validaciones
      const newUser: UserType = {
        id: `USER_${Date.now()}`,
        name: formData.name,
        role: formData.role,
        permissions: getPermissionsByRole(formData.role)
      };
      onLogin(newUser);
    }
  };

  const getPermissionsByRole = (role: string) => {
    switch (role) {
      case 'ADFU12': return ['validate', 'reports', 'admin', 'offline'];
      case 'TUR001': return ['declarations', 'upload'];
      case 'TRANS202': return ['vehicles', 'status'];
      case 'SAG_AGENT': return ['food_validation', 'pet_validation'];
      default: return ['declarations'];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'password') {
      handlePasswordChange(e as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
      setError('');
    }
  };

  const demoCredentials = [
    { email: 'admin@samore.cl', password: 'Admin123!', role: 'Administrador' },
    { email: 'turista@samore.cl', password: 'Turista123!', role: 'Turista' },
    { email: 'transportista@samore.cl', password: 'Trans123!', role: 'Transportista' },
    { email: 'sag@samore.cl', password: 'Sag123!', role: 'Funcionario SAG' }
  ];

  // Determinar si el botón debe estar deshabilitado
  const isSubmitDisabled = !isLogin && !passwordValidation.isValid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Control Fronterizo
            </h1>
            <p className="text-gray-600">Paso Samoré</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setPasswordValidation({ hasUpperCase: false, hasSpecialChar: false, isValid: false });
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setFormData(prev => ({ ...prev, password: '' }));
                setPasswordValidation({ hasUpperCase: false, hasSpecialChar: false, isValid: false });
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                !isLogin 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrarse</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="correo@ejemplo.cl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    !isLogin && formData.password && !passwordValidation.isValid
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements (Solo en registro) */}
              {!isLogin && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Requisitos de contraseña:</span>
                  </div>
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passwordValidation.hasUpperCase ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <AlertCircle className="w-4 h-4" />
                      }
                      <span className="font-medium">Al menos una letra MAYÚSCULA (A-Z)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passwordValidation.hasSpecialChar ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <AlertCircle className="w-4 h-4" />
                      }
                      <span className="font-medium">Al menos un carácter especial (!@#$%^&*...)</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-sm ${
                      formData.password.length >= 6 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.password.length >= 6 ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <AlertCircle className="w-4 h-4" />
                      }
                      <span className="font-medium">Mínimo 6 caracteres</span>
                    </div>
                  </div>
                  
                  {formData.password && !passwordValidation.isValid && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <strong>⚠️ Ejemplo de contraseña válida:</strong> MiContraseña123!
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="TUR001">Turista</option>
                  <option value="TRANS202">Transportista</option>
                  <option value="SAG_AGENT">Funcionario SAG</option>
                  <option value="ADFU12">Administrador</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all transform ${
                isSubmitDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isLogin
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:scale-105'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:scale-105'
              }`}
            >
              {isSubmitDisabled ? 
                'Complete los requisitos de contraseña' : 
                (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')
              }
            </button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Credenciales de Prueba:</h3>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;