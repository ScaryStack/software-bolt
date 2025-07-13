import React, { useState, useEffect } from 'react';
import { BarChart3, Car, Users, FileText, CheckCircle, Clock, XCircle, ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { User } from '../types';

interface TouristOverviewProps {
  user: User;
  onTabChange: (tab: string) => void;
}

const TouristOverview: React.FC<TouristOverviewProps> = ({ user, onTabChange }) => {
  const [stats, setStats] = useState({
    vehicles: { total: 0, approved: 0, pending: 0, rejected: 0 },
    minors: { total: 0, complete: 0, incomplete: 0 },
    declarations: { total: 0, approved: 0, pending: 0, rejected: 0 }
  });

  // Actualizar estadísticas en tiempo real
  useEffect(() => {
    const updateStats = () => {
      const vehicles = JSON.parse(localStorage.getItem('tourist_vehicles') || '[]')
        .filter((v: any) => v.owner.toLowerCase().includes(user.name.toLowerCase()) || v.id.includes(user.id));
      
      const minors = JSON.parse(localStorage.getItem('tourist_minors') || '[]')
        .filter((m: any) => m.guardian.toLowerCase().includes(user.name.toLowerCase()) || m.id.includes(user.id));
      
      const declarations = JSON.parse(localStorage.getItem('declarations') || '[]')
        .filter((d: any) => d.traveler.toLowerCase().includes(user.name.toLowerCase()) || d.id.includes(user.id));

      setStats({
        vehicles: {
          total: vehicles.length,
          approved: vehicles.filter((v: any) => v.status === 'approved').length,
          pending: vehicles.filter((v: any) => v.status === 'pending').length,
          rejected: vehicles.filter((v: any) => v.status === 'rejected').length
        },
        minors: {
          total: minors.length,
          complete: minors.filter((m: any) => m.status === 'complete').length,
          incomplete: minors.filter((m: any) => m.status === 'incomplete').length
        },
        declarations: {
          total: declarations.length,
          approved: declarations.filter((d: any) => d.status === 'approved').length,
          pending: declarations.filter((d: any) => d.status === 'pending').length,
          rejected: declarations.filter((d: any) => d.status === 'rejected').length
        }
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000); // Actualizar cada segundo
    return () => clearInterval(interval);
  }, [user]);

  const quickActions = [
    {
      id: 'tourist-vehicles',
      title: 'Registrar Vehículo',
      description: 'Agregar un nuevo vehículo al sistema',
      icon: Car,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      stats: `${stats.vehicles.total} registrados`
    },
    {
      id: 'tourist-minors',
      title: 'Registrar Menor',
      description: 'Agregar un menor de edad a mi cargo',
      icon: Users,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      stats: `${stats.minors.total} registrados`
    },
    {
      id: 'declarations',
      title: 'Nueva Declaración',
      description: 'Crear declaración de alimentos o mascotas',
      icon: FileText,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      stats: `${stats.declarations.total} declaraciones`
    }
  ];

  const getProgressPercentage = (approved: number, total: number) => {
    return total > 0 ? (approved / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              ¡Hola, {user.name}! 👋
            </h2>
            <p className="text-blue-100">
              Aquí tienes un resumen de toda tu actividad en el sistema
            </p>
            <p className="text-sm text-blue-200 mt-1">
              Última actualización: {new Date().toLocaleTimeString('es-CL')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {stats.vehicles.total + stats.minors.total + stats.declarations.total}
            </div>
            <div className="text-sm text-blue-200">
              Total de registros
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicles Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <button
              onClick={() => onTabChange('tourist-vehicles')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos →
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mis Vehículos</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{stats.vehicles.total}</span>
              <span className="text-sm text-gray-500">Total registrados</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Aprobados: {stats.vehicles.approved}</span>
                <span className="text-yellow-600">⏳ Pendientes: {stats.vehicles.pending}</span>
              </div>
              {stats.vehicles.rejected > 0 && (
                <div className="text-sm text-red-600">❌ Rechazados: {stats.vehicles.rejected}</div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage(stats.vehicles.approved, stats.vehicles.total)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Minors Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <button
              onClick={() => onTabChange('tourist-minors')}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Ver todos →
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Menores a Cargo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{stats.minors.total}</span>
              <span className="text-sm text-gray-500">Total registrados</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Completos: {stats.minors.complete}</span>
                <span className="text-red-600">⚠️ Incompletos: {stats.minors.incomplete}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage(stats.minors.complete, stats.minors.total)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Declarations Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <button
              onClick={() => onTabChange('declarations')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Ver todas →
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mis Declaraciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">{stats.declarations.total}</span>
              <span className="text-sm text-gray-500">Total enviadas</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Aprobadas: {stats.declarations.approved}</span>
                <span className="text-yellow-600">⏳ Pendientes: {stats.declarations.pending}</span>
              </div>
              {stats.declarations.rejected > 0 && (
                <div className="text-sm text-red-600">❌ Rechazadas: {stats.declarations.rejected}</div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage(stats.declarations.approved, stats.declarations.total)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onTabChange(action.id)}
              className={`${action.color} ${action.hoverColor} text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <action.icon className="w-8 h-8" />
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold mb-2">{action.title}</h4>
                <p className="text-sm opacity-90 mb-3">{action.description}</p>
                <div className="text-xs opacity-75">{action.stats}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Items */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 text-yellow-600 mr-2" />
              Elementos Pendientes
            </h4>
            <div className="space-y-2">
              {stats.vehicles.pending > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Vehículos pendientes</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-800">{stats.vehicles.pending}</span>
                </div>
              )}
              {stats.minors.incomplete > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800">Menores con documentos incompletos</span>
                  </div>
                  <span className="text-sm font-medium text-red-800">{stats.minors.incomplete}</span>
                </div>
              )}
              {stats.declarations.pending > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Declaraciones pendientes</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-800">{stats.declarations.pending}</span>
                </div>
              )}
              {stats.vehicles.pending === 0 && stats.minors.incomplete === 0 && stats.declarations.pending === 0 && (
                <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">¡Todo al día! No hay elementos pendientes</span>
                </div>
              )}
            </div>
          </div>

          {/* Success Summary */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Elementos Aprobados
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Vehículos aprobados</span>
                </div>
                <span className="text-sm font-medium text-green-800">{stats.vehicles.approved}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Menores con documentos completos</span>
                </div>
                <span className="text-sm font-medium text-green-800">{stats.minors.complete}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Declaraciones aprobadas</span>
                </div>
                <span className="text-sm font-medium text-green-800">{stats.declarations.approved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristOverview;