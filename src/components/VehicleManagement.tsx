import React, { useState, useEffect } from 'react';
import { Car, CheckCircle, XCircle, Clock, Search, Filter, Plus, Upload, FileText } from 'lucide-react';
import { Vehicle, User } from '../types';

interface VehicleManagementProps {
  user: User;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    type: '',
    owner: '',
    documents: [] as string[]
  });

  const isAdmin = user.permissions.includes('admin') || user.permissions.includes('validate');
  const canValidate = user.permissions.includes('validate') || user.permissions.includes('admin');
  const isTourist = user.role === 'TUR001';

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedVehicles = localStorage.getItem('vehicles');
    if (savedVehicles) {
      setVehicleList(JSON.parse(savedVehicles));
    } else {
      // Datos iniciales si no hay datos guardados
      const initialVehicles = [
        {
          id: '1',
          plate: 'ABC123',
          type: 'Automóvil',
          owner: 'Juan Pérez',
          status: 'approved' as const,
          date: '2024-01-15',
          documents: ['Permiso de circulación', 'Cédula de identidad']
        },
        {
          id: '2',
          plate: 'XYZ789',
          type: 'Camión',
          owner: 'Transportes Unidos Ltda.',
          status: 'rejected' as const,
          date: '2024-01-15',
          documents: ['Permiso de circulación']
        },
        {
          id: '3',
          plate: 'DEF456',
          type: 'Motocicleta',
          owner: 'Pedro González',
          status: 'pending' as const,
          date: '2024-01-15',
          documents: ['Permiso de circulación', 'Cédula de identidad', 'Licencia de conducir']
        }
      ];
      setVehicleList(initialVehicles);
      localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
    }
  }, []);

  // Guardar en localStorage cuando cambie la lista
  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicleList));
  }, [vehicleList]);

  // Filter vehicles based on user role
  const getUserVehicles = () => {
    if (isAdmin) {
      return vehicleList;
    }
    // Para turistas, mostrar solo sus propios vehículos
    return vehicleList.filter(vehicle => 
      vehicle.owner.toLowerCase().includes(user.name.toLowerCase()) ||
      vehicle.id.includes(user.id)
    );
  };

  const filteredVehicles = getUserVehicles().filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setVehicleList(prev => 
      prev.map(vehicle => 
        vehicle.id === id ? { ...vehicle, status } : vehicle
      )
    );
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      plate: newVehicle.plate,
      type: newVehicle.type,
      owner: newVehicle.owner || user.name,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      documents: newVehicle.documents
    };
    
    setVehicleList(prev => [...prev, vehicle]);
    setNewVehicle({ plate: '', type: '', owner: '', documents: [] });
    setShowAddForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setNewVehicle(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileNames]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setNewVehicle(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Car className="w-8 h-8 text-blue-600 mr-3" />
          {isAdmin ? 'Gestión de Vehículos' : 'Mis Vehículos'}
        </h2>
        {isTourist && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Vehículo</span>
          </button>
        )}
      </div>

      {/* Add Vehicle Form (Tourists only) */}
      {isTourist && showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nuevo Vehículo</h3>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patente *
                </label>
                <input
                  type="text"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo *
                </label>
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Automóvil">Automóvil</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Camión">Camión</option>
                  <option value="Motocicleta">Motocicleta</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propietario
              </label>
              <input
                type="text"
                value={newVehicle.owner || user.name}
                onChange={(e) => setNewVehicle(prev => ({ ...prev, owner: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del propietario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos del Vehículo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="vehicle-documents"
                />
                <label
                  htmlFor="vehicle-documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Haz clic para subir documentos o arrastra aquí
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 10MB cada uno)
                  </span>
                </label>
              </div>
              
              {newVehicle.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Documentos subidos:</p>
                  {newVehicle.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Documentos requeridos:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>Permiso de circulación vigente</li>
                  <li>Cédula de identidad del propietario</li>
                  <li>Licencia de conducir (si aplica)</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Vehículo
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary for Tourists */}
      {isTourist && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehículos</p>
                <p className="text-2xl font-bold text-gray-900">{getUserVehicles().length}</p>
              </div>
              <Car className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">
                  {getUserVehicles().filter(v => v.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazados</p>
                <p className="text-2xl font-bold text-red-600">
                  {getUserVehicles().filter(v => v.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por patente o propietario..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                {canValidate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {vehicle.plate}
                        </div>
                        <div className="text-sm text-gray-500">{vehicle.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(vehicle.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status === 'approved' ? 'Aprobado' : 
                         vehicle.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vehicle.date).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {vehicle.documents?.map((doc, index) => (
                        <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {doc}
                        </div>
                      ))}
                    </div>
                  </td>
                  {canValidate && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {vehicle.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateStatus(vehicle.id, 'approved')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateStatus(vehicle.id, 'rejected')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;