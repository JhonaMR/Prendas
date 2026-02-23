// ============================================
// API SERVICE: Sistema de Fichas
// Adaptado al patrón del proyecto (window.API_CONFIG + auth_token)
// ============================================

import type { Disenadora, FichaDiseno, FichaCosto, Maleta, FichaFormData, CorteFormData } from '../types/typesFichas';

declare global {
    interface Window {
        API_CONFIG?: { getApiUrl: () => string; };
    }
}

function getApiUrl(): string {
    if (window.API_CONFIG?.getApiUrl) return window.API_CONFIG.getApiUrl();
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000/api`;
}

function getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
}

// ===== DISEÑADORAS =====

export const getDisenadoras = async (): Promise<Disenadora[]> => {
    const r = await fetch(`${getApiUrl()}/disenadoras`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

export const createDisenadora = async (disenadora: Partial<Disenadora>): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/disenadoras`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(disenadora)
    });
    return r.json();
};

export const updateDisenadora = async (id: string, disenadora: Partial<Disenadora>): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/disenadoras/${id}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(disenadora)
    });
    return r.json();
};

export const deleteDisenadora = async (id: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/disenadoras/${id}`, { method: 'DELETE', headers: getHeaders() });
    return r.json();
};

// ===== FICHAS DE DISEÑO =====

export const getFichasDiseno = async (): Promise<FichaDiseno[]> => {
    const r = await fetch(`${getApiUrl()}/fichas-diseno`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

export const getFichaDiseno = async (referencia: string): Promise<FichaDiseno | null> => {
    const r = await fetch(`${getApiUrl()}/fichas-diseno/${referencia}`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || null;
};

export const createFichaDiseno = async (ficha: FichaFormData, createdBy: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-diseno`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...ficha, createdBy })
    });
    return r.json();
};

export const updateFichaDiseno = async (referencia: string, ficha: FichaFormData): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-diseno/${referencia}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(ficha)
    });
    return r.json();
};

export const deleteFichaDiseno = async (referencia: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-diseno/${referencia}`, { method: 'DELETE', headers: getHeaders() });
    return r.json();
};

export const uploadFotoFicha = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('foto', file);
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${getApiUrl()}/fichas-diseno/upload-foto`, {
        method: 'POST',
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: formData
    });
    return r.json();
};

// ===== FICHAS DE COSTO =====

export const getFichasCosto = async (): Promise<FichaCosto[]> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

export const getFichaCosto = async (referencia: string): Promise<FichaCosto | null> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || null;
};

export const importarFichaDiseno = async (referencia: string, createdBy: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/importar`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ referencia, createdBy })
    });
    return r.json();
};

export const createFichaCosto = async (ficha: FichaFormData, rentabilidad: number, createdBy: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...ficha, rentabilidad, createdBy })
    });
    return r.json();
};

export const updateFichaCosto = async (referencia: string, ficha: FichaFormData, precioVenta?: number, rentabilidad?: number): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify({ ...ficha, precioVenta, rentabilidad })
    });
    return r.json();
};

// ===== CORTES =====

export const crearCorte = async (referencia: string, corte: CorteFormData, createdBy: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}/cortes`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...corte, createdBy })
    });
    return r.json();
};

export const updateCorte = async (referencia: string, numeroCorte: number, corte: CorteFormData): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}/cortes/${numeroCorte}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(corte)
    });
    return r.json();
};

// ===== MALETAS =====

export const getMaletas = async (): Promise<Maleta[]> => {
    const r = await fetch(`${getApiUrl()}/maletas`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

export const getMaleta = async (id: string): Promise<Maleta | null> => {
    const r = await fetch(`${getApiUrl()}/maletas/${id}`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || null;
};

export const createMaleta = async (nombre: string, correriaId: string | null, referencias: string[], createdBy: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/maletas`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ nombre, correriaId, referencias, createdBy })
    });
    return r.json();
};

export const updateMaleta = async (id: string, nombre?: string, correriaId?: string | null, referencias?: string[]): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/maletas/${id}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify({ nombre, correriaId, referencias })
    });
    return r.json();
};

export const deleteMaleta = async (id: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/maletas/${id}`, { method: 'DELETE', headers: getHeaders() });
    return r.json();
};

export const getReferenciasSinCorreria = async (): Promise<any[]> => {
    const r = await fetch(`${getApiUrl()}/maletas/referencias-sin-correria`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

const apiFichas = {
    getDisenadoras, createDisenadora, updateDisenadora, deleteDisenadora,
    getFichasDiseno, getFichaDiseno, createFichaDiseno, updateFichaDiseno, deleteFichaDiseno, uploadFotoFicha,
    getFichasCosto, getFichaCosto, importarFichaDiseno, createFichaCosto, updateFichaCosto,
    crearCorte, updateCorte,
    getMaletas, getMaleta, createMaleta, updateMaleta, deleteMaleta, getReferenciasSinCorreria
};

export default apiFichas;
