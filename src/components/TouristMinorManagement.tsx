import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Search, Plus, Upload, FileText, AlertCircle, User } from 'lucide-react';
import { User as UserType } from '../types';

interface TouristMinor {
  id: string;
  fullName: string;
  age: number;
  guardian: string;
  isDirectFamily: boolean;
  status: 'complete' | 'incomplete';
  date: string;
  documents: {
    idCard?: string;
    notarialAuthorization?: string;
  };
}

interface TouristMinorManagementProps {
  user: UserType;
}

const TouristMinorManagement: React.FC<TouristMinorManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minorList, setMinorList] = useState<TouristMinor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMinor, setNewMinor] = useState({
    fullName: '',
    age: '',
    guardian: '',
    isDirectFamily: true,
    documents: {
      idCard: '',
      notarialAuthorization: ''
    }
  });

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedMinors = localStorage.getItem('tourist_minors');
    if (savedMinors) {
      setMinorList(JSON.parse(savedMinors));
    }
  }, []);

  // Guardar en localStorage cuando cambie la lista
  useEffect(() => {
    localStorage.setItem('tourist_minors', JSON.stringify(minorList));
  }, [minorList]);

  // Filtrar menores del usuario actual
  const userMinors = minorList.filter(minor => 
    minor.guardian.toLowerCase().includes(user.name.toLowerCase()) ||
    minor.id.includes(user.id)
  );

  const filteredMinors = userMinors.filter(minor =>
    minor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minor.guardian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMinor = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determinar si está completo basado en documentos requeridos
    const hasIdCard = !!newMinor.documents.idCard;
    const hasNotarialAuth = newMinor.isDirectFamily || !!newMinor.documents.notarialAuthorization;
    const isComplete = hasIdCard && hasNotarialAuth;
    
    const minor: TouristMinor = {
      id: `${user.id}_${Date.now()}`,
      fullName: newMinor.fullName,
      age: parseInt(newMinor.age),
      guardian: newMinor.guardian || user.name,
      isDirectFamily: newMinor.isDirectFamily,
      status: isComplete ? 'complete' : 'incomplete',
      date: new Date().toISOString().split('T')[0],
      documents: { ...newMinor.documents }
    };
    
    setMinorList(prev => [...prev, minor]);
    setNewMinor({
      fullName: '',
      age: '',
      guardian: '',
      isDirectFamily: true,
      documents: {
        idCard: '',
        notarialAuthorization: ''
      }
    });
    setShowAddForm(false);
  };

  const handleFileUpload = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMinor(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file.name
        }
      }));
    }
  };

  const removeDocument = (documentType: string) => {
    setNewMinor(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: ''
      }
    }));
  };

  const getStatusIcon = (status: string) => {
    return status === 'complete' ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'complete' ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  const getDocumentStatus = (minor: TouristMinor) => {
    const hasIdCard = !!minor.documents.idCard;
    const needsNotarialAuth = !minor.isDirectFamily;
    const hasNotarialAuth = !!minor.documents.notarialAuthorization;
    
    let completed = 0;
    let total = 1; // Cédula siempre requerida
    
    if (hasIdCard) completed++;
    if (needsNotarialAuth) {
      total++;
      if (hasNotarialAuth) completed++;
    }
    
    return { completed, total, isComplete: completed === total };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-8 h-8 text-blue-600 mr-3" />
          Menores a mi Cargo
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Menor</span>
        </button>
      </div>

      {/* Add Minor Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Menor de Edad</h3>
          <form onSubmit={handleAddMinor} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newMinor.fullName}
                  onChange={(e) => setNewMinor(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre y apellidos completos"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  value={newMinor.age}
                  onChange={(e) => setNewMinor(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Edad en años"
                  min="0"
                  max="17"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutor/Responsable Legal
                </label>
                <input
                  type="text"
                  value={newMinor.guardian || user.name}
                  onChange={(e) => setNewMinor(prev => ({ ...prev, guardian: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del tutor"
                />
              </div>
            </div>

            {/* Family Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Relación Familiar
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="direct-family"
                    name="familyRelation"
                    checked={newMinor.isDirectFamily}
                    onChange={() => setNewMinor(prev => ({ ...prev, isDirectFamily: true }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="direct-family" className="ml-3 text-sm text-gray-700">
                    Es familiar directo (padre, madre, abuelo, abuela, hermano mayor de edad)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="not-direct-family"
                    name="familyRelation"
                    checked={!newMinor.isDirectFamily}
                    onChange={() => setNewMinor(prev => ({ ...prev, isDirectFamily: false }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="not-direct-family" className="ml-3 text-sm text-gray-700">
                    No es familiar directo (requiere autorización notarial)
                  </label>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Documentos del Menor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cédula de Identidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula de Identidad del Menor *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('idCard', e)}
                      className="hidden"
                      id="minor-id-card"
                    />
                    <label htmlFor="minor-id-card" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Subir cédula de identidad</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (máx. 10MB)</span>
                    </label>
                  </div>
                  {newMinor.documents.idCard && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newMinor.documents.idCard}</span>
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

                {/* Autorización Notarial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Autorización Notarial {!newMinor.isDirectFamily && '*'}
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-4 ${
                    newMinor.isDirectFamily ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('notarialAuthorization', e)}
                      className="hidden"
                      id="notarial-auth"
                      disabled={newMinor.isDirectFamily}
                    />
                    <label 
                      htmlFor="notarial-auth" 
                      className={`flex flex-col items-center justify-center ${
                        newMinor.isDirectFamily ? 'cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <Upload className={`w-6 h-6 mb-2 ${
                        newMinor.isDirectFamily ? 'text-gray-300' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        newMinor.isDirectFamily ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {newMinor.isDirectFamily ? 'No requerido para familiares directos' : 'Subir autorización notarial'}
                      </span>
                      {!newMinor.isDirectFamily && (
                        <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (máx. 10MB)</span>
                      )}
                    </label>
                  </div>
                  {newMinor.documents.notarialAuthorization && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">{newMinor.documents.notarialAuthorization}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument('notarialAuthorization')}
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
                      <li>Cédula de identidad del menor (siempre requerida)</li>
                      <li>Autorización notarial (solo si no es familiar directo)</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      <strong>Familiares directos:</strong> padre, madre, abuelo, abuela, hermano mayor de edad.
                      <br />
                      <strong>No familiares directos:</strong> tío, primo, amigo de la familia, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Menor
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
              <p className="text-sm text-gray-600">Total Menores</p>
              <p className="text-2xl font-bold text-gray-900">{userMinors.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos Completos</p>
              <p className="text-2xl font-bold text-green-600">
                {userMinors.filter(m => m.status === 'complete').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos Incompletos</p>
              <p className="text-2xl font-bold text-red-600">
                {userMinors.filter(m => m.status === 'incomplete').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Familiares Directos</p>
              <p className="text-2xl font-bold text-purple-600">
                {userMinors.filter(m => m.isDirectFamily).length}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre del menor o tutor..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Minor List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutor/Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Documentos
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
              {filteredMinors.map((minor) => {
                const docStatus = getDocumentStatus(minor);
                return (
                  <tr key={minor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {minor.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{minor.age} años</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {minor.guardian}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        minor.isDirectFamily ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {minor.isDirectFamily ? 'Familiar directo' : 'No familiar directo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(minor.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(minor.status)}`}>
                          {minor.status === 'complete' ? 'Completo' : 'Incompleto'}
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
                        {minor.documents.idCard && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            Cédula de identidad
                          </div>
                        )}
                        {minor.documents.notarialAuthorization && (
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            Autorización notarial
                          </div>
                        )}
                        {minor.status === 'incomplete' && (
                          <div className="text-xs bg-red-100 px-2 py-1 rounded text-red-700">
                            ⚠️ {!minor.documents.idCard ? 'Falta cédula' : 'Falta autorización notarial'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(minor.date).toLocaleDateString('es-CL')}
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

export default TouristMinorManagement;