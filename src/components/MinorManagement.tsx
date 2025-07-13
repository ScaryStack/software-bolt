import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, Search, Plus, Upload, FileText } from 'lucide-react';
import { Minor, User } from '../types';

interface MinorManagementProps {
  user: User;
}

const MinorManagement: React.FC<MinorManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minorList, setMinorList] = useState<Minor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMinor, setNewMinor] = useState({
    name: '',
    age: '',
    guardian: '',
    documents: [] as string[]
  });

  const isAdmin = user.permissions.includes('admin') || user.permissions.includes('validate');
  const isTourist = user.role === 'TUR001';

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedMinors = localStorage.getItem('minors');
    if (savedMinors) {
      setMinorList(JSON.parse(savedMinors));
    } else {
      // Datos iniciales si no hay datos guardados
      const initialMinors = [
        {
          id: '1',
          name: 'Sofía Hernández',
          age: 8,
          guardian: 'Lucia Hernández',
          documents: ['Cédula de identidad', 'Autorización notarial'],
          status: 'complete' as const,
          date: '2024-01-15'
        },
        {
          id: '2',
          name: 'Diego Martín',
          age: 12,
          guardian: 'Roberto Martín',
          documents: ['Cédula de identidad'],
          status: 'incomplete' as const,
          date: '2024-01-15'
        }
      ];
      setMinorList(initialMinors);
      localStorage.setItem('minors', JSON.stringify(initialMinors));
    }
  }, []);

  // Guardar en localStorage cuando cambie la lista
  useEffect(() => {
    localStorage.setItem('minors', JSON.stringify(minorList));
  }, [minorList]);

  // Filter minors based on user role
  const getUserMinors = () => {
    if (isAdmin) {
      return minorList;
    }
    // Para turistas, mostrar solo sus propios menores
    return minorList.filter(minor => 
      minor.guardian.toLowerCase().includes(user.name.toLowerCase()) ||
      minor.id.includes(user.id)
    );
  };

  const filteredMinors = getUserMinors().filter(minor => 
    minor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minor.guardian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMinor = (e: React.FormEvent) => {
    e.preventDefault();
    const minor: Minor = {
      id: Date.now().toString(),
      name: newMinor.name,
      age: parseInt(newMinor.age),
      guardian: newMinor.guardian || user.name,
      documents: newMinor.documents,
      status: newMinor.documents.length >= 2 ? 'complete' : 'incomplete',
      date: new Date().toISOString().split('T')[0]
    };
    
    setMinorList(prev => [...prev, minor]);
    setNewMinor({ name: '', age: '', guardian: '', documents: [] });
    setShowAddForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setNewMinor(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileNames]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setNewMinor(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    return status === 'complete' ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'complete' ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-8 h-8 text-blue-600 mr-3" />
          {isAdmin ? 'Gestión de Menores' : 'Registro de Menores'}
        </h2>
        {isTourist && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Menor</span>
          </button>
        )}
      </div>

      {/* Add Minor Form (Tourists only) */}
      {isTourist && showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrar Menor</h3>
          <form onSubmit={handleAddMinor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Menor *
                </label>
                <input
                  type="text"
                  value={newMinor.name}
                  onChange={(e) => setNewMinor(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo"
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
                  Tutor/Responsable
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos del Menor *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="minor-documents"
                />
                <label
                  htmlFor="minor-documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Subir cédula de identidad y autorización notarial
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 10MB cada uno)
                  </span>
                </label>
              </div>
              
              {newMinor.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Documentos subidos:</p>
                  {newMinor.documents.map((doc, index) => (
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
                  <li>Cédula de identidad del menor</li>
                  <li>Autorización notarial del tutor</li>
                  <li>Certificado de nacimiento (opcional)</li>
                  <li>Pasaporte del menor (si aplica)</li>
                </ul>
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

      {/* Summary for Tourists */}
      {isTourist && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Menores</p>
                <p className="text-2xl font-bold text-gray-900">{getUserMinors().length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documentos Completos</p>
                <p className="text-2xl font-bold text-green-600">
                  {getUserMinors().filter(m => m.status === 'complete').length}
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
                  {getUserMinors().filter(m => m.status === 'incomplete').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

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
                  Estado Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMinors.map((minor) => (
                <tr key={minor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {minor.name}
                        </div>
                        <div className="text-sm text-gray-500">{minor.age} años</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {minor.guardian}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(minor.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(minor.status)}`}>
                        {minor.status === 'complete' ? 'Completo' : 'Incompleto'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(minor.date).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {minor.documents.map((doc, index) => (
                        <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {doc}
                        </div>
                      ))}
                      {minor.status === 'incomplete' && (
                        <div className="text-xs bg-red-100 px-2 py-1 rounded text-red-700">
                          ⚠️ Falta autorización notarial
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MinorManagement;