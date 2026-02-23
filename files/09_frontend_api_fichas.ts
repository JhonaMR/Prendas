// ============================================
// API SERVICE: Sistema de Fichas
// Métodos para comunicación con backend
// ============================================

import { Disenadora, FichaDiseno, FichaCosto, Corte, Maleta, FichaFormData, CorteFormData } from './typesFichas';

// ===== CONFIGURACIÓN =====
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;

// ===== HELPERS =====
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// ============================================
// DISEÑADORAS
// ============================================

export const getDisenadoras = async (): Promise<Disenadora[]> => {
  const response = await fetch(`${API_URL}/disenadoras`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || [];
};

export const createDisenadora = async (disenadora: Partial<Disenadora>): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/disenadoras`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(disenadora)
  });
  return await response.json();
};

export const updateDisenadora = async (id: string, disenadora: Partial<Disenadora>): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/disenadoras/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(disenadora)
  });
  return await response.json();
};

export const deleteDisenadora = async (id: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/disenadoras/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return await response.json();
};

// ============================================
// FICHAS DE DISEÑO
// ============================================

export const getFichasDiseno = async (): Promise<FichaDiseno[]> => {
  const response = await fetch(`${API_URL}/fichas-diseno`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || [];
};

export const getFichaDiseno = async (referencia: string): Promise<FichaDiseno | null> => {
  const response = await fetch(`${API_URL}/fichas-diseno/${referencia}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || null;
};

export const createFichaDiseno = async (ficha: FichaFormData, createdBy: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-diseno`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...ficha, createdBy })
  });
  return await response.json();
};

export const updateFichaDiseno = async (referencia: string, ficha: FichaFormData): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-diseno/${referencia}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(ficha)
  });
  return await response.json();
};

export const deleteFichaDiseno = async (referencia: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-diseno/${referencia}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return await response.json();
};

export const uploadFotoFicha = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('foto', file);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/fichas-diseno/upload-foto`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: formData
  });
  return await response.json();
};

// ============================================
// FICHAS DE COSTO
// ============================================

export const getFichasCosto = async (): Promise<FichaCosto[]> => {
  const response = await fetch(`${API_URL}/fichas-costo`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || [];
};

export const getFichaCosto = async (referencia: string): Promise<FichaCosto | null> => {
  const response = await fetch(`${API_URL}/fichas-costo/${referencia}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || null;
};

export const importarFichaDiseno = async (referencia: string, createdBy: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-costo/importar`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ referencia, createdBy })
  });
  return await response.json();
};

export const createFichaCosto = async (ficha: FichaFormData, rentabilidad: number, createdBy: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-costo`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...ficha, rentabilidad, createdBy })
  });
  return await response.json();
};

export const updateFichaCosto = async (
  referencia: string, 
  ficha: FichaFormData,
  precioVenta?: number,
  rentabilidad?: number
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-costo/${referencia}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ ...ficha, precioVenta, rentabilidad })
  });
  return await response.json();
};

// ============================================
// CORTES
// ============================================

export const crearCorte = async (
  referencia: string, 
  corte: CorteFormData, 
  createdBy: string
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-costo/${referencia}/cortes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...corte, createdBy })
  });
  return await response.json();
};

export const updateCorte = async (
  referencia: string, 
  numeroCorte: number, 
  corte: CorteFormData
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/fichas-costo/${referencia}/cortes/${numeroCorte}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(corte)
  });
  return await response.json();
};

// ============================================
// MALETAS
// ============================================

export const getMaletas = async (): Promise<Maleta[]> => {
  const response = await fetch(`${API_URL}/maletas`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || [];
};

export const getMaleta = async (id: string): Promise<Maleta | null> => {
  const response = await fetch(`${API_URL}/maletas/${id}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || null;
};

export const createMaleta = async (
  nombre: string,
  correriaId: string | null,
  referencias: string[],
  createdBy: string
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/maletas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ nombre, correriaId, referencias, createdBy })
  });
  return await response.json();
};

export const updateMaleta = async (
  id: string,
  nombre?: string,
  correriaId?: string | null,
  referencias?: string[]
): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/maletas/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ nombre, correriaId, referencias })
  });
  return await response.json();
};

export const deleteMaleta = async (id: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/maletas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return await response.json();
};

export const getReferenciasSinCorreria = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/maletas/referencias-sin-correria`, {
    headers: getHeaders()
  });
  const data = await response.json();
  return data.data || [];
};

// ============================================
// EXPORTAR TODAS LAS FUNCIONES
// ============================================

export default {
  // Diseñadoras
  getDisenadoras,
  createDisenadora,
  updateDisenadora,
  deleteDisenadora,
  
  // Fichas Diseño
  getFichasDiseno,
  getFichaDiseno,
  createFichaDiseno,
  updateFichaDiseno,
  deleteFichaDiseno,
  uploadFotoFicha,
  
  // Fichas Costo
  getFichasCosto,
  getFichaCosto,
  importarFichaDiseno,
  createFichaCosto,
  updateFichaCosto,
  
  // Cortes
  crearCorte,
  updateCorte,
  
  // Maletas
  getMaletas,
  getMaleta,
  createMaleta,
  updateMaleta,
  deleteMaleta,
  getReferenciasSinCorreria
};
