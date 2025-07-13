import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Filter, Car, FileText, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminTrafficCharts: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');
  const [trafficData, setTrafficData] = useState({
    vehicles: { approved: 0, rejected: 0, pending: 0, total: 0 },
    declarations: { approved: 0, rejected: 0, pending: 0, total: 0 },
    minors: { complete: 0, incomplete: 0, total: 0 },
    hourlyData: [] as Array<{ hour: string, vehicles: number, declarations: number }>
  });

  // Actualizar datos en tiempo real
  useEffect(() => {
    const updateTrafficData = () => {
      const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      const touristVehicles = JSON.parse(localStorage.getItem('tourist_vehicles') || '[]');
      const allVehicles = [...vehicles, ...touristVehicles];
      
      const declarations = JSON.parse(localStorage.getItem('declarations') || '[]');
      const minors = JSON.parse(localStorage.getItem('minors') || '[]');
      const touristMinors = JSON.parse(localStorage.getItem('tourist_minors') || '[]');
      const allMinors = [...minors, ...touristMinors];

      // Filtrar por período
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'day':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      const filteredVehicles = allVehicles.filter((v: any) => new Date(v.date) >= filterDate);
      const filteredDeclarations = declarations.filter((d: any) => new Date(d.date) >= filterDate);
      const filteredMinors = allMinors.filter((m: any) => new Date(m.date) >= filterDate);

      // Generar datos por hora para el día actual
      const hourlyData = [];
      if (timeFilter === 'day') {
        for (let i = 0; i < 24; i++) {
          const hour = i.toString().padStart(2, '0') + ':00';
          const hourStart = new Date();
          hourStart.setHours(i, 0, 0, 0);
          const hourEnd = new Date();
          hourEnd.setHours(i, 59, 59, 999);
          
          const vehiclesInHour = allVehicles.filter((v: any) => {
            const vDate = new Date(v.date);
            return vDate >= hourStart && vDate <= hourEnd;
          }).length;
          
          const declarationsInHour = declarations.filter((d: any) => {
            const dDate = new Date(d.date);
            return dDate >= hourStart && dDate <= hourEnd;
          }).length;
          
          hourlyData.push({
            hour,
            vehicles: vehiclesInHour,
            declarations: declarationsInHour
          });
        }
      }

      setTrafficData({
        vehicles: {
          approved: filteredVehicles.filter((v: any) => v.status === 'approved').length,
          rejected: filteredVehicles.filter((v: any) => v.status === 'rejected').length,
          pending: filteredVehicles.filter((v: any) => v.status === 'pending').length,
          total: filteredVehicles.length
        },
        declarations: {
          approved: filteredDeclarations.filter((d: any) => d.status === 'approved').length,
          rejected: filteredDeclarations.filter((d: any) => d.status === 'rejected').length,
          pending: filteredDeclarations.filter((d: any) => d.status === 'pending').length,
          total: filteredDeclarations.length
        },
        minors: {
          complete: filteredMinors.filter((m: any) => m.status === 'complete').length,
          incomplete: filteredMinors.filter((m: any) => m.status === 'incomplete').length,
          total: filteredMinors.length
        },
        hourlyData
      });
    };

    updateTrafficData();
    const interval = setInterval(updateTrafficData, 2000); // Actualizar cada 2 segundos
    return () => clearInterval(interval);
  }, [timeFilter]);

  const getMaxValue = () => {
    if (timeFilter === 'day' && trafficData.hourlyData.length > 0) {
      return Math.max(...trafficData.hourlyData.map(d => Math.max(d.vehicles, d.declarations))) || 1;
    }
    return Math.max(trafficData.vehicles.total, trafficData.declarations.total) || 1;
  };

  const maxValue = getMaxValue();

  const getTimeLabel = () => {
    switch (timeFilter) {
      case 'day': return 'Hoy';
      case 'week': return 'Últimos 7 días';
      case 'month': return 'Último mes';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            Tránsito {getTimeLabel()} - Actualización en tiempo real
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'day' | 'week' | 'month')}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Real-time stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Vehículos {getTimeLabel()}</p>
              <p className="text-2xl font-bold">{trafficData.vehicles.total}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-green-200">✅ {trafficData.vehicles.approved}</span>
                <span className="text-red-200">❌ {trafficData.vehicles.rejected}</span>
                <span className="text-yellow-200">⏳ {trafficData.vehicles.pending}</span>
              </div>
            </div>
            <Car className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Declaraciones {getTimeLabel()}</p>
              <p className="text-2xl font-bold">{trafficData.declarations.total}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-green-200">✅ {trafficData.declarations.approved}</span>
                <span className="text-red-200">❌ {trafficData.declarations.rejected}</span>
                <span className="text-yellow-200">⏳ {trafficData.declarations.pending}</span>
              </div>
            </div>
            <FileText className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Menores {getTimeLabel()}</p>
              <p className="text-2xl font-bold">{trafficData.minors.total}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="text-green-200">✅ {trafficData.minors.complete}</span>
                <span className="text-red-200">⚠️ {trafficData.minors.incomplete}</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Hourly chart for daily view */}
      {timeFilter === 'day' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 text-blue-600 mr-2" />
            Tránsito por Hora - {new Date().toLocaleDateString('es-CL')}
          </h4>
          <div className="space-y-3">
            {trafficData.hourlyData.slice(-12).map((data, index) => (
              <div key={data.hour} className="flex items-center space-x-3">
                <div className="w-12 text-xs text-gray-600 font-mono">
                  {data.hour}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  {/* Vehicles bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-600">Vehículos</span>
                      <span className="text-xs text-gray-500">{data.vehicles}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${maxValue > 0 ? (data.vehicles / maxValue) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Declarations bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-600">Declaraciones</span>
                      <span className="text-xs text-gray-500">{data.declarations}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${maxValue > 0 ? (data.declarations / maxValue) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {trafficData.hourlyData.every(d => d.vehicles === 0 && d.declarations === 0) && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No hay actividad registrada para hoy</p>
            </div>
          )}
        </div>
      )}

      {/* Status distribution chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Estado de Vehículos</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Aprobados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.vehicles.total > 0 ? (trafficData.vehicles.approved / trafficData.vehicles.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.vehicles.approved}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">Rechazados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.vehicles.total > 0 ? (trafficData.vehicles.rejected / trafficData.vehicles.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.vehicles.rejected}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Pendientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.vehicles.total > 0 ? (trafficData.vehicles.pending / trafficData.vehicles.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.vehicles.pending}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Estado de Declaraciones</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Aprobadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.declarations.total > 0 ? (trafficData.declarations.approved / trafficData.declarations.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.declarations.approved}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">Rechazadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.declarations.total > 0 ? (trafficData.declarations.rejected / trafficData.declarations.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.declarations.rejected}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">Pendientes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${trafficData.declarations.total > 0 ? (trafficData.declarations.pending / trafficData.declarations.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{trafficData.declarations.pending}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrafficCharts;