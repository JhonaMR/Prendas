// ============================================
// CONTENEDOR: Fichas de Confección
// Maneja el estado con localStorage y enruta
// entre Histórico y Editor
// ============================================

import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import { FichaConfeccionRecord } from './types';
import HistoricoFichasConfeccion from './HistoricoFichasConfeccion';
import FichaConfeccionEditor from './FichaConfeccionEditor';

const LS_KEY = 'fichas_confeccion_v1';

function cargarFichas(): FichaConfeccionRecord[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function guardarFichas(fichas: FichaConfeccionRecord[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(fichas));
}

interface Props {
    user: any;
    state: AppState;
    onNavigate: (tab: string, params?: any) => void;
    params?: any;
}

const FichaConfeccionContainer: React.FC<Props> = ({ user, state, onNavigate, params }) => {
    const [fichas, setFichas] = useState<FichaConfeccionRecord[]>(cargarFichas);
    const [vista, setVista] = useState<'historico' | 'editor'>('historico');
    const [fichaIdEditar, setFichaIdEditar] = useState<string | undefined>(undefined);

    // Si llega params con fichaId, ir directo al editor
    useEffect(() => {
        if (params?.fichaId) {
            setFichaIdEditar(params.fichaId);
            setVista('editor');
        } else if (params?.nueva) {
            setFichaIdEditar(undefined);
            setVista('editor');
        }
    }, [params]);

    const handleNavInterna = (tab: string, p?: any) => {
        if (tab === 'fichas-confeccion') {
            setVista('historico');
            setFichaIdEditar(undefined);
        } else if (tab === 'ficha-confeccion-editor') {
            setFichaIdEditar(p?.fichaId);
            setVista('editor');
        } else {
            // Navegación externa (home, etc.)
            onNavigate(tab, p);
        }
    };

    const handleGuardar = (ficha: FichaConfeccionRecord) => {
        setFichas(prev => {
            const existe = prev.findIndex(f => f.id === ficha.id);
            const nuevas = existe >= 0
                ? prev.map(f => f.id === ficha.id ? ficha : f)
                : [...prev, ficha];
            guardarFichas(nuevas);
            return nuevas;
        });
    };

    const handleEliminar = (id: string) => {
        setFichas(prev => {
            const nuevas = prev.filter(f => f.id !== id);
            guardarFichas(nuevas);
            return nuevas;
        });
    };

    if (vista === 'editor') {
        return (
            <FichaConfeccionEditor
                user={user}
                state={state}
                onNavigate={handleNavInterna}
                fichaId={fichaIdEditar}
                fichas={fichas}
                onGuardar={handleGuardar}
            />
        );
    }

    return (
        <HistoricoFichasConfeccion
            user={user}
            onNavigate={handleNavInterna}
            fichas={fichas}
            onEliminar={handleEliminar}
        />
    );
};

export default FichaConfeccionContainer;
