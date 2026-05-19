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
    
    // Fallback - detectar puerto basado en ubicación actual
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    let backendPort = '3000';
    if (port === '5173' || port === '3000' || port === '') {
      backendPort = '3000'; // PLOW
    } else if (port === '5174' || port === '3001') {
      backendPort = '3001'; // MELAS
    }
    
    return `${protocol}//${hostname}:${backendPort}/api`;
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

export const uploadMoldeFicha = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('psd', file);
    const token = localStorage.getItem('auth_token');
    const r = await fetch(`${getApiUrl()}/fichas-diseno/upload-psd`, {
        method: 'POST',
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: formData
    });
    return r.json();
};

// ===== FICHAS DE CONFECCION =====

export const getFichasConfeccion = async (): Promise<any[]> => {
    try {
        const r = await fetch(`${getApiUrl()}/fichas-confeccion`, { headers: getHeaders() });
        
        // Validar que la respuesta sea OK
        if (!r.ok) {
            console.warn(`API retornó status ${r.status}, intentando fallback a BD directa`);
            return getFichasConfeccionDirecto();
        }
        
        const d = await r.json();
        
        // Validar que la respuesta tenga estructura correcta
        if (!d || typeof d !== 'object') {
            console.warn('API retornó respuesta inválida, intentando fallback a BD directa');
            return getFichasConfeccionDirecto();
        }
        
        // Validar que success sea true
        if (d.success === false) {
            console.warn('API retornó success: false, intentando fallback a BD directa');
            return getFichasConfeccionDirecto();
        }
        
        // Retornar datos o array vacío
        return d.data || [];
    } catch (error) {
        console.error('Error en getFichasConfeccion:', error);
        console.warn('Intentando fallback a BD directa');
        return getFichasConfeccionDirecto();
    }
};

// Fallback: Llamada directa a BD
const getFichasConfeccionDirecto = async (): Promise<any[]> => {
    try {
        const token = localStorage.getItem('auth_token');
        const r = await fetch(`${getApiUrl()}/fichas-confeccion`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });
        
        if (!r.ok) {
            console.error('Fallback también falló con status:', r.status);
            return [];
        }
        
        const d = await r.json();
        return d.data || [];
    } catch (error) {
        console.error('Error en fallback getFichasConfeccionDirecto:', error);
        return [];
    }
};

export const createFichaConfeccion = async (ficha: any): Promise<ApiResponse> => {
    try {
        const r = await fetch(`${getApiUrl()}/fichas-confeccion`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(ficha)
        });
        
        if (!r.ok) {
            console.error('Error al crear ficha:', r.status);
            return { success: false, message: `Error ${r.status}` };
        }
        
        const d = await r.json();
        return d || { success: false, message: 'Respuesta vacía' };
    } catch (error) {
        console.error('Error en createFichaConfeccion:', error);
        return { success: false, message: 'Error de conexión' };
    }
};

export const updateFichaConfeccion = async (id: string, ficha: any): Promise<ApiResponse> => {
    try {
        const r = await fetch(`${getApiUrl()}/fichas-confeccion/${id}`, {
            method: 'PUT', headers: getHeaders(), body: JSON.stringify(ficha)
        });
        
        if (!r.ok) {
            console.error('Error al actualizar ficha:', r.status);
            return { success: false, message: `Error ${r.status}` };
        }
        
        const d = await r.json();
        return d || { success: false, message: 'Respuesta vacía' };
    } catch (error) {
        console.error('Error en updateFichaConfeccion:', error);
        return { success: false, message: 'Error de conexión' };
    }
};

export const deleteFichaConfeccion = async (id: string): Promise<ApiResponse> => {
    try {
        const r = await fetch(`${getApiUrl()}/fichas-confeccion/${id}`, {
            method: 'DELETE', headers: getHeaders()
        });
        
        if (!r.ok) {
            console.error('Error al eliminar ficha:', r.status);
            return { success: false, message: `Error ${r.status}` };
        }
        
        const d = await r.json();
        return d || { success: false, message: 'Respuesta vacía' };
    } catch (error) {
        console.error('Error en deleteFichaConfeccion:', error);
        return { success: false, message: 'Error de conexión' };
    }
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

export const updateFichaCosto = async (referencia: string, ficha: FichaFormData, precioVenta?: number, rentabilidad?: number, estadoRevision?: string | null): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify({ ...ficha, precioVenta, rentabilidad, estadoRevision })
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

export const deleteCorte = async (referencia: string, numeroCorte: number): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/fichas-costo/${referencia}/cortes/${numeroCorte}`, {
        method: 'DELETE', headers: getHeaders()
    });
    return r.json();
};



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

export const updateMaleta = async (id: string, nombre?: string, correriaId?: string | null, referencias?: string[], recepcion?: { estado?: string; recibidoPor?: string; fechaRecepcion?: string; numReferenciasRecibidas?: number }): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/maletas/${id}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify({ nombre, correriaId, referencias, ...recepcion })
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

export const getReferenciasMaletaRecibidas = async (maletaId: string): Promise<any[]> => {
    const r = await fetch(`${getApiUrl()}/maletas/${maletaId}/referencias-recibidas`, { headers: getHeaders() });
    const d = await r.json();
    return d.data || [];
};

export const createReferenciaRecibida = async (maletaId: string, referencia: string, recibidoPor: string, fechaRecepcion: string): Promise<ApiResponse> => {
    const r = await fetch(`${getApiUrl()}/maletas/${maletaId}/referencias-recibidas`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ referencia, recibidoPor, fechaRecepcion })
    });
    const d = await r.json();
    return d;
};

const apiFichas = {
    getDisenadoras, createDisenadora, updateDisenadora, deleteDisenadora,
    getFichasDiseno, getFichaDiseno, createFichaDiseno, updateFichaDiseno, deleteFichaDiseno,
    uploadFotoFicha, uploadMoldeFicha,
    getFichasCosto, getFichaCosto, importarFichaDiseno, createFichaCosto, updateFichaCosto,
    crearCorte, updateCorte, deleteCorte,
    getMaletas, getMaleta, createMaleta, updateMaleta, deleteMaleta, getReferenciasSinCorreria, getReferenciasMaletaRecibidas, createReferenciaRecibida,
    getFichasConfeccion, createFichaConfeccion, updateFichaConfeccion, deleteFichaConfeccion,
};

export default apiFichas;
