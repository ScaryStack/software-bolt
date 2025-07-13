import React, { useState } from 'react';
import { User, Shield, Car, Plane, FileCheck } from 'lucide-react';
import { users } from '../data/mockData';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUser);
    if (user) {
      onLogin(user);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADFU12': return <Shield className="w-6 h-6" />;
      case 'TUR001': return <Plane className="w-6 h-6" />;
      case 'TRANS202': return <Car className="w-6 h-6" />;
      case 'SAG_AGENT': return <FileCheck className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADFU12': return 'Administrador de trámites fronterizos';
      case 'TUR001': return 'Usuario turista';
      case 'TRANS202': return 'Transportista';
      case 'SAG_AGENT': return 'Funcionario SAG';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema Control Fronterizo
          </h1>
          <p className="text-gray-600">Paso Samoré</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Perfil de Usuario
          </label>
          
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedUser === user.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedUser(user.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedUser === user.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getRoleIcon(user.role)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{user.name}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-mono">
                      {user.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRoleDescription(user.role)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;