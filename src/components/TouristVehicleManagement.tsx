import React, { useState, useEffect } from 'react';
import { Car, CheckCircle, XCircle, Clock, Search, Plus, Upload, FileText, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface TouristVehicle {
  id: string;
  plate: string;
  type: string;
  owner: string;
  status: 'approved' | 'rejected' | 'pending';
  date: string;
  documents: {
    circulationPermit?: string;
    driverLicense?: string;
    idCard?: string;
    soap?: string;
    vehicleRegistry?: string;
  };
}

interface TouristVehicleManagementProps {
  user: User;
}

const TouristVehicleManagement: React.FC<TouristVehicleManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleList, setVehicleList] = useState<TouristVehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    type: '',
    owner: '',
    documents: {
      circulationPermit: '',
      driverLicense: '',
      idCard: '',
      soap: '',
      vehicleRegistry: ''
    }
  });

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedVehicles = localStorage.getItem('tourist_vehicles');
    if (savedVehicles) {
      setVehicleList(JSON.parse(savedVehicles));
    }
  }, []);

  // Guardar en localStorage cuando cambie la lista
  useEffect(() => {
    localStorage.setItem('tourist_vehicles', JSON.stringify(vehicleList));
  }, [vehicleList]);

  // Filtrar vehículos del usuario actual
  const userVehicles = vehicleList.filter(vehicle => 
    vehicle.owner.toLowerCase().includes(user.name.toLowerCase()) ||
    vehicle.id.includes(user.id)
  );

  const filteredVehicles = userVehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vehicle: TouristVehicle = {
      id: `${user.id}_${Date.now()}`,
      plate: newVehicle.plate.toUpperCase(),
      type: newVehicle.type,
      owner: newVehicle.owner || user.name,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      documents: { ...newVehicle.documents }
    };
    
    setVehicleList(prev => [...prev, vehicle]);
    setNewVehicle({
      plate: '',
      type: '',
      owner: '',
      documents: {
        circulationPermit: '',
        driverLicense: '',
        idCard: '',
        soap: '',
        vehicleRegistry: ''
      }
    });
    setShowAddForm(false);
  };

  const handleFileUpload = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVehicle(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file.name
        }
      }));
    }
  };

  const removeDocument = (documentType: string) => {
    setNewVehicle(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: ''
      }
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

  const getDocumentStatus = (documents: TouristVehicle['documents']) => {
    const requiredDocs = ['circulationPermit', 'driverLicense', 'idCard'];
    const uploadedRequired = requiredDocs.filter(doc => documents[doc as keyof typeof documents]);
    return {
      completed: uploadedRequired.length,
      total: requiredDocs.length,
      isComplete: uploadedRequired.length === requiredDocs.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Car className="w-8 h-8 text-blue-600 mr-3" />
          Mis Vehículos
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Vehículo</span>
        </button>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Nuevo Vehículo</h3>
          <form onSubmit={handleAddVehicle} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  maxLength={6}
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
                  <option value="Casa Rodante">Casa Rodante</option>
                </select>
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
            </div>

            {/* Documents Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Documentos del Vehículo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Permiso de Circulación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permiso de Circulación *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('circulationPermit', e)}
                      className="hidden"
                      id="circulation-permit"
                    />
                    <label htmlFor="circulation-permit" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir permiso de circulación</span>
                    </label>
                  </div>
                  {newVehicle.documents.circulationPermit && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newVehicle.documents.circulationPermit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('circulationPermit')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Licencia de Conducir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Licencia de Conducir *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('driverLicense', e)}
                      className="hidden"
                      id="driver-license"
                    />
                    <label htmlFor="driver-license" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir licencia de conducir</span>
                    </label>
                  </div>
                  {newVehicle.documents.driverLicense && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newVehicle.documents.driverLicense}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('driverLicense')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Cédula de Identidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula de Identidad *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('idCard', e)}
                      className="hidden"
                      id="id-card"
                    />
                    <label htmlFor="id-card" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir cédula de identidad</span>
                    </label>
                  </div>
                  {newVehicle.documents.idCard && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newVehicle.documents.idCard}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('idCard')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* SOAP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SOAP (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('soap', e)}
                      className="hidden"
                      id="soap"
                    />
                    <label htmlFor="soap" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir SOAP</span>
                    </label>
                  </div>
                  {newVehicle.documents.soap && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newVehicle.documents.soap}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('soap')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Padrón de Vehículo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padrón de Vehículo (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('vehicleRegistry', e)}
                      className="hidden"
                      id="vehicle-registry"
                    />
                    <label htmlFor="vehicle-registry" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir padrón de vehículo</span>
                    </label>
                  </div>
                  {newVehicle.documents.vehicleRegistry && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newVehicle.documents.vehicleRegistry}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('vehicleRegistry')}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Documentos requeridos:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Permiso de circulación vigente</li>
                      <li>Licencia de conducir válida</li>
                      <li>Cédula de identidad del propietario</li>
                    </ul>
                    <p className="mt-2 text-xs">Los documentos SOAP y Padrón de Vehículo son opcionales pero recomendados.</p>
                  </div>
                </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehículos</p>
              <p className="text-2xl font-bold text-gray-900">{userVehicles.length}</p>
            </div>
            <Car className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">
                {userVehicles.filter(v => v.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {userVehicles.filter(v => v.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">
                {userVehicles.filter(v => v.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por patente o tipo de vehículo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => {
                const docStatus = getDocumentStatus(vehicle.documents);
                return (
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
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`text-xs px-2 py-1 rounded ${
                          docStatus.isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {docStatus.completed}/{docStatus.total} documentos requeridos
                        </div>
                        {Object.entries(vehicle.documents).map(([key, value]) => {
                          if (value) {
                            const labels = {
                              circulationPermit: 'Permiso circulación',
                              driverLicense: 'Licencia conducir',
                              idCard: 'Cédula identidad',
                              soap: 'SOAP',
                              vehicleRegistry: 'Padrón vehículo'
                            };
                            return (
                              <div key={key} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {labels[key as keyof typeof labels]}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicle.date).toLocaleDateString('es-CL')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TouristVehicleManagement;