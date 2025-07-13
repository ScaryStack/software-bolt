import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Car, FileText, Users, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types';

interface QuickAccessMenuProps {
  user: UserType;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ 
  user, 
  activeTab, 
  onTabChange, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Resumen General', 
      icon: BarChart3, 
      permissions: ['validate', 'admin'],
      color: 'text-blue-600'
    },
    { 
      id: 'tourist-vehicles', 
      label: 'Mis Vehículos', 
      icon: Car, 
      permissions: ['declarations', 'upload'],
      color: 'text-green-600'
    },
    { 
      id: 'tourist-minors', 
      label: 'Menores a Cargo', 
      icon: Users, 
      permissions: ['declarations', 'upload'],
      color: 'text-purple-600'
    },
    { 
      id: 'vehicles', 
      label: 'Gestión de Vehículos', 
      icon: Car, 
      permissions: ['validate', 'vehicles', 'admin'],
      color: 'text-green-600'
    },
    { 
      id: 'declarations', 
      label: 'Declaraciones SAG', 
      icon: FileText, 
      permissions: ['declarations', 'food_validation', 'pet_validation', 'admin'],
      color: 'text-orange-600'
    },
    { 
      id: 'minors', 
      label: 'Control de Menores', 
      icon: Users, 
      permissions: ['validate', 'admin'],
      color: 'text-purple-600'
    },
    { 
      id: 'reports', 
      label: 'Informes y Estadísticas', 
      icon: BarChart3, 
      permissions: ['reports', 'admin'],
      color: 'text-red-600'
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.permissions.some(permission => user.permissions.includes(permission))
  );

  const currentItem = visibleItems.find(item => item.id === activeTab) || visibleItems[0];

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Quick Access Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-all shadow-sm min-w-[250px]"
      >
        <div className={`p-2 rounded-lg bg-gray-100 ${currentItem?.color}`}>
          {currentItem && <currentItem.icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentItem?.label || 'Seleccionar Sección'}
          </div>
          <div className="text-xs text-gray-500">
            Acceso rápido a funciones
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeTab === item.id ? 'bg-blue-100' : 'bg-gray-100'
                } ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${
                    activeTab === item.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {item.label}
                  </div>
                </div>
              </button>
            ))}
            
            {/* Separator */}
            <div className="border-t border-gray-100 my-2"></div>
            
            {/* User Info & Logout */}
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.id}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccessMenu;