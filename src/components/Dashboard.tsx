import React, { useState } from 'react';
import { User as UserType } from '../types';
import { LogOut, BarChart3, FileText, Car, Heart, Users, WifiOff, Wifi, CheckCircle } from 'lucide-react';
import VehicleManagement from './VehicleManagement';
import DeclarationManagement from './DeclarationManagement';
import Reports from './Reports';
import MinorManagement from './MinorManagement';
import QuickAccessMenu from './QuickAccessMenu';
import TouristVehicleManagement from './TouristVehicleManagement';
import TouristMinorManagement from './TouristMinorManagement';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOffline, setIsOffline] = useState(false);

  const toggleOffline = () => setIsOffline(!isOffline);
  
  // Obtener datos en tiempo real desde localStorage
  const getRealtimeStats = () => {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const declarations = JSON.parse(localStorage.getItem('declarations') || '[]');
    const minors = JSON.parse(localStorage.getItem('minors') || '[]');
    
    return {
      vehicles: {
        total: vehicles.length,
        approved: vehicles.filter((v: any) => v.status === 'approved').length,
        pending: vehicles.filter((v: any) => v.status === 'pending').length
      },
      declarations: {
        total: declarations.length,
        approved: declarations.filter((d: any) => d.status === 'approved').length,
        pending: declarations.filter((d: any) => d.status === 'pending').length
      },
      minors: {
        total: minors.length,
        complete: minors.filter((m: any) => m.status === 'complete').length,
        incomplete: minors.filter((m: any) => m.status === 'incomplete').length
      }
    };
  };
  
  const stats = getRealtimeStats();
  const isAdmin = user.permissions.includes('admin') || user.permissions.includes('validate');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3, permissions: ['validate', 'admin'] },
    { id: 'tourist-vehicles', label: 'Mis Vehículos', icon: Car, permissions: ['declarations', 'upload'] },
    { id: 'tourist-minors', label: 'Menores a Cargo', icon: Users, permissions: ['declarations', 'upload'] },
    { id: 'vehicles', label: 'Vehículos', icon: Car, permissions: ['validate', 'vehicles', 'admin'] },
    { id: 'declarations', label: 'Declaraciones', icon: FileText, permissions: ['declarations', 'food_validation', 'pet_validation', 'admin'] },
    { id: 'minors', label: 'Menores', icon: Users, permissions: ['validate', 'admin'] },
    { id: 'reports', label: 'Informes', icon: BarChart3, permissions: ['reports', 'admin'] }
  ];

  const visibleTabs = tabs.filter(tab => 
    tab.permissions.some(permission => user.permissions.includes(permission))
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tourist-vehicles':
        return <TouristVehicleManagement user={user} />;
      case 'tourist-minors':
        return <TouristMinorManagement user={user} />;
      case 'vehicles':
        return <VehicleManagement user={user} />;
      case 'declarations':
        return <DeclarationManagement user={user} />;
      case 'minors':
        return <MinorManagement user={user} />;
      case 'reports':
        return <Reports user={user} />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bienvenido, {user.name}
                  </h2>
                  <p className="text-blue-100">
                    Sistema de Control Fronterizo - Paso Samoré
                  </p>
                  <p className="text-sm text-blue-200 mt-1">
                    Perfil: {user.id} | {new Date().toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm text-blue-200">
                    Hora local
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vehículos Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.vehicles.total}</p>
                    <p className="text-xs text-green-600">{stats.vehicles.approved} aprobados</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Declaraciones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.declarations.total}</p>
                    <p className="text-xs text-green-600">{stats.declarations.approved} aprobadas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Users className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menores</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.minors.total}</p>
                    <p className="text-xs text-green-600">{stats.minors.complete} completos</p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.vehicles.pending + stats.declarations.pending + stats.minors.incomplete}
                      </p>
                      <p className="text-xs text-red-600">Requieren atención</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleTabs.slice(1).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <tab.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{tab.label}</div>
                      <div className="text-xs text-gray-500">Gestionar {tab.label.toLowerCase()}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Control Fronterizo - Paso Samoré
              </h1>
              {user.permissions.includes('offline') && (
                <button
                  onClick={toggleOffline}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all ${
                    isOffline 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  <span>{isOffline ? 'Offline' : 'Online'}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Access Menu */}
              <QuickAccessMenu 
                user={user}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;