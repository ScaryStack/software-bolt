export interface User {
  id: string;
  name: string;
  role: 'ADFU12' | 'TUR001' | 'TRANS202' | 'SAG_AGENT';
  permissions: string[];
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
  owner: string;
  status: 'approved' | 'rejected' | 'pending';
  date: string;
  documents?: string[];
}

export interface Declaration {
  id: string;
  type: 'food' | 'pet';
  items: string[];
  traveler: string;
  status: 'approved' | 'rejected' | 'pending';
  date: string;
  notes?: string;
}

export interface Minor {
  id: string;
  name: string;
  age: number;
  guardian: string;
  documents: string[];
  status: 'complete' | 'incomplete';
  date: string;
}

export interface Report {
  date: string;
  vehicles: { total: number; approved: number; rejected: number };
  declarations: { total: number; approved: number; rejected: number };
  minors: { total: number; complete: number; incomplete: number };
}