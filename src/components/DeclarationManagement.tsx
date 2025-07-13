import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Search, Apple, Heart, Plus, Upload, Download } from 'lucide-react';
import { Declaration, User } from '../types';

interface DeclarationManagementProps {
  user: User;
}

const DeclarationManagement: React.FC<DeclarationManagementProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [declarationList, setDeclarationList] = useState<Declaration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeclaration, setNewDeclaration] = useState({
    type: 'food' as 'food' | 'pet',
    items: [''],
    traveler: '',
    documents: [] as string[]
  });

  const isAdmin = user.permissions.includes('admin') || 
                 user.permissions.includes('food_validation') || 
                 user.permissions.includes('pet_validation');

  const canValidate = user.permissions.includes('food_validation') || 
                     user.permissions.includes('pet_validation') || 
                     user.permissions.includes('admin');

  const isTourist = user.role === 'TUR001';

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const savedDeclarations = localStorage.getItem('declarations');
    if (savedDeclarations) {
      setDeclarationList(JSON.parse(savedDeclarations));
    } else {
      // Datos iniciales si no hay datos guardados
      const initialDeclarations = [
        {
          id: '1',
          type: 'food' as const,
          items: ['Queso', 'Jamón'],
          traveler: 'María Rodríguez',
          status: 'approved' as const,
          date: '2024-01-15',
          notes: 'Productos en regla'
        },
        {
          id: '2',
          type: 'pet' as const,
          items: ['Perro doméstico'],
          traveler: 'Carlos Jiménez',
          status: 'pending' as const,
          date: '2024-01-15'
        },
        {
          id: '3',
          type: 'food' as const,
          items: ['Carne vacuna'],
          traveler: 'Ana Morales',
          status: 'rejected' as const,
          date: '2024-01-15',
          notes: 'Falta certificado sanitario'
        }
      ];
      setDeclarationList(initialDeclarations);
      localStorage.setItem('declarations', JSON.stringify(initialDeclarations));
    }
  }, []);

  // Guardar en localStorage cuando cambie la lista
  useEffect(() => {
    localStorage.setItem('declarations', JSON.stringify(declarationList));
  }, [declarationList]);

  // Filter declarations based on user role
  const getUserDeclarations = () => {
    if (isAdmin) {
      return declarationList;
    }
    // Para turistas, mostrar solo sus propias declaraciones
    return declarationList.filter(declaration => 
      declaration.traveler.toLowerCase().includes(user.name.toLowerCase()) ||
      declaration.id.includes(user.id)
    );
  };

  const filteredDeclarations = getUserDeclarations().filter(declaration => {
    const matchesSearch = declaration.traveler.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || declaration.type === typeFilter;
    
    // Filter by user permissions for admin users
    if (user.permissions.includes('food_validation') && !user.permissions.includes('admin')) {
      return declaration.type === 'food' && matchesSearch && matchesType;
    }
    if (user.permissions.includes('pet_validation') && !user.permissions.includes('admin')) {
      return declaration.type === 'pet' && matchesSearch && matchesType;
    }
    
    return matchesSearch && matchesType;
  });

  const updateStatus = (id: string, status: 'approved' | 'rejected', notes?: string) => {
    setDeclarationList(prev => 
      prev.map(declaration => 
        declaration.id === id ? { ...declaration, status, notes } : declaration
      )
    );
  };

  const handleAddDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    const declaration: Declaration = {
      id: Date.now().toString(),
      type: newDeclaration.type,
      items: newDeclaration.items.filter(item => item.trim() !== ''),
      traveler: newDeclaration.traveler || user.name,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setDeclarationList(prev => [...prev, declaration]);
    setNewDeclaration({ type: 'food', items: [''], traveler: '', documents: [] });
    setShowAddForm(false);
  };

  const addItem = () => {
    setNewDeclaration(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const updateItem = (index: number, value: string) => {
    setNewDeclaration(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  const removeItem = (index: number) => {
    setNewDeclaration(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setNewDeclaration(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileNames]
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'food' ? 
      <Apple className="w-5 h-5 text-green-600" /> : 
      <Heart className="w-5 h-5 text-pink-600" />;
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
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          {isAdmin ? 'Gestión de Declaraciones' : 'Mis Declaraciones'}
        </h2>
        {isTourist && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Declaración</span>
          </button>
        )}
      </div>

      {/* Add Declaration Form (Tourists only) */}
      {isTourist && showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Declaración</h3>
          <form onSubmit={handleAddDeclaration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Declaración *
                </label>
                <select
                  value={newDeclaration.type}
                  onChange={(e) => setNewDeclaration(prev => ({ ...prev, type: e.target.value as 'food' | 'pet' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="food">Alimentos</option>
                  <option value="pet">Mascotas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Viajero
                </label>
                <input
                  type="text"
                  value={newDeclaration.traveler || user.name}
                  onChange={(e) => setNewDeclaration(prev => ({ ...prev, traveler: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del viajero"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {newDeclaration.type === 'food' ? 'Productos Alimentarios' : 'Información de Mascotas'} *
              </label>
              <div className="space-y-2">
                {newDeclaration.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={newDeclaration.type === 'food' ? 'Ej: Queso, Jamón, Frutas' : 'Ej: Perro doméstico, Gato'}
                      required={index === 0}
                    />
                    {newDeclaration.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Agregar otro {newDeclaration.type === 'food' ? 'producto' : 'animal'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos de Respaldo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="declaration-documents"
                />
                <label
                  htmlFor="declaration-documents"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Subir certificados, facturas o documentos
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 10MB cada uno)
                  </span>
                </label>
              </div>
              
              {newDeclaration.documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Documentos subidos:</p>
                  {newDeclaration.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewDeclaration(prev => ({
                          ...prev,
                          documents: prev.documents.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Documentos requeridos según tipo:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  {newDeclaration.type === 'food' ? (
                    <>
                      <li>Certificado sanitario (productos cárnicos)</li>
                      <li>Factura o comprobante de compra</li>
                      <li>Certificado fitosanitario (productos vegetales)</li>
                    </>
                  ) : (
                    <>
                      <li>Certificado veterinario</li>
                      <li>Certificado de vacunación</li>
                      <li>Pasaporte de mascota (si aplica)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Declaración
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
                <p className="text-sm text-gray-600">Total Declaraciones</p>
                <p className="text-2xl font-bold text-gray-900">{getUserDeclarations().length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {getUserDeclarations().filter(d => d.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {getUserDeclarations().filter(d => d.status === 'rejected').length}
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
                placeholder="Buscar por viajero o producto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="food">Alimentos</option>
              <option value="pet">Mascotas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Declaration List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viajero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                {canValidate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeclarations.map((declaration) => (
                <tr key={declaration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        declaration.type === 'food' ? 'bg-green-100' : 'bg-pink-100'
                      }`}>
                        {getTypeIcon(declaration.type)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {declaration.type === 'food' ? 'Alimentos' : 'Mascotas'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {declaration.traveler}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {declaration.items.map((item, index) => (
                        <div key={index} className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {item}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(declaration.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(declaration.status)}`}>
                        {declaration.status === 'approved' ? 'Aprobado' : 
                         declaration.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(declaration.date).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {declaration.notes && (
                      <div className="bg-yellow-50 px-2 py-1 rounded text-yellow-800 text-xs">
                        {declaration.notes}
                      </div>
                    )}
                  </td>
                  {canValidate && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {declaration.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateStatus(declaration.id, 'approved', 'Aprobado por inspector')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateStatus(declaration.id, 'rejected', 'Requiere documentación adicional')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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

export default DeclarationManagement;