import { User, Vehicle, Declaration, Minor } from '../types';

export const users: User[] = [
  {
    id: 'ADFU12',
    name: 'Carlos Mendoza',
    role: 'ADFU12',
    permissions: ['validate', 'reports', 'admin', 'offline']
  },
  {
    id: 'TUR001',
    name: 'María García',
    role: 'TUR001',
    permissions: ['declarations', 'upload']
  },
  {
    id: 'TRANS202',
    name: 'Roberto Silva',
    role: 'TRANS202',
    permissions: ['vehicles', 'status']
  },
  {
    id: 'SAG_AGENT',
    name: 'Ana López',
    role: 'SAG_AGENT',
    permissions: ['food_validation', 'pet_validation']
  }
];

export const vehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABC123',
    type: 'Automóvil',
    owner: 'Juan Pérez',
    status: 'approved',
    date: '2024-01-15',
    documents: ['Permiso de circulación', 'Cédula de identidad']
  },
  {
    id: '2',
    plate: 'XYZ789',
    type: 'Camión',
    owner: 'Transportes Unidos Ltda.',
    status: 'rejected',
    date: '2024-01-15',
    documents: ['Permiso de circulación']
  },
  {
    id: '3',
    plate: 'DEF456',
    type: 'Motocicleta',
    owner: 'Pedro González',
    status: 'pending',
    date: '2024-01-15',
    documents: ['Permiso de circulación', 'Cédula de identidad', 'Licencia de conducir']
  }
];

export const declarations: Declaration[] = [
  {
    id: '1',
    type: 'food',
    items: ['Queso', 'Jamón'],
    traveler: 'María Rodríguez',
    status: 'approved',
    date: '2024-01-15',
    notes: 'Productos en regla'
  },
  {
    id: '2',
    type: 'pet',
    items: ['Perro doméstico'],
    traveler: 'Carlos Jiménez',
    status: 'pending',
    date: '2024-01-15'
  },
  {
    id: '3',
    type: 'food',
    items: ['Carne vacuna'],
    traveler: 'Ana Morales',
    status: 'rejected',
    date: '2024-01-15',
    notes: 'Falta certificado sanitario'
  }
];

export const minors: Minor[] = [
  {
    id: '1',
    name: 'Sofía Hernández',
    age: 8,
    guardian: 'Lucia Hernández',
    documents: ['Cédula de identidad', 'Autorización notarial'],
    status: 'complete',
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Diego Martín',
    age: 12,
    guardian: 'Roberto Martín',
    documents: ['Cédula de identidad'],
    status: 'incomplete',
    date: '2024-01-15'
  }
];