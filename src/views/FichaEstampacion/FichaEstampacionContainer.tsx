// ============================================
// CONTENEDOR: Fichas de Estampacion
// Usa la BD via apiFichas
// ============================================

import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import { FichaEstampacionRecord } from './types';
import apiFichas from '../../services/apiFichas';
import HistoricoFichasEstampacion from './HistoricoFichasEstampacion';
import FichaEstampacionEditor from './FichaEstampacionEditor';

interface Props {
    user: any;
    state: AppState;
    onNavigate: (tab: string, params?: any) => void;
    params?: any;
}

// Convierte el objeto plano de la BD al formato FichaEstampacionRecord que usa el editor
function dbToRecord(fe: any): FichaEstampacionRecord {
    return {
        id: fe.id,
        referencia: fe.referencia,
        cantidadCortada: fe.cantidad || '',
        fechaCreacion: fe.createdAt
            ? new Date(fe.createdAt).toLocaleDateString('es-CO')
            : '',
        realizadoPor: fe.fichaRealizadaPor || '',
        responsable: fe.responsable || '',
        data: {
            referencia: fe.referencia,
            fechaEnvio: fe.fechaEnvio || '',
            fechaEntrega: fe.fechaEntrega || '',
            linea: '',
            marca: '',
            nMuestra: '',
            nCorte: fe.nCorte || '',
            cantidad: fe.cantidad || '',
            fichaRealizadaPor: fe.fichaRealizadaPor || '',
            descripcion: fe.descripcion || '',
            precios: fe.precios || [
                { concepto: 'ESTAMPADO', valor: '' },
                { concepto: 'PEGADA APLIQUE', valor: '' }
            ],
            fotoSeleccionada: (fe.fotoSeleccionada as 1 | 2 | 3) || 1,
            observaciones: fe.observaciones || ['', '', ''],
            responsable: fe.responsable || '',
            pintasActivo: fe.pintasActivo ?? true,
            pintas: fe.pintas || [
                { label: '', fotoPath: null },
                { label: '', fotoPath: null }
            ],
            combinacionColores: fe.combinacionColores || Array(5).fill(null).map(() => Array(6).fill(''))
        },
    };
}

// Convierte FichaEstampacionRecord al payload para la BD
function recordToDb(record: FichaEstampacionRecord, createdBy: string) {
    const d = record.data;
    return {
        id: record.id,
        referencia: d.referencia,
        fechaEnvio: d.fechaEnvio,
        fechaEntrega: d.fechaEntrega,
        nCorte: d.nCorte,
        cantidad: d.cantidad,
        fichaRealizadaPor: d.fichaRealizadaPor,
        descripcion: d.descripcion,
        precios: d.precios,
        fotoSeleccionada: d.fotoSeleccionada,
        observaciones: d.observaciones,
        responsable: d.responsable,
        pintasActivo: d.pintasActivo,
        pintas: d.pintas,
        combinacionColores: d.combinacionColores,
        createdBy,
    };
}

const FichaEstampacionContainer: React.FC<Props> = ({ user, state, onNavigate, params }) => {
    const [fichas, setFichas] = useState<FichaEstampacionRecord[]>([]);
    const [cargando, setCargando] = useState(true);
    const [vista, setVista] = useState<'historico' | 'editor'>('historico');
    const [fichaIdEditar, setFichaIdEditar] = useState<string | undefined>(undefined);

    // Cargar fichas desde la BD al montar
    useEffect(() => {
        cargarFichas();
    }, []);

    // Navegar si llegan params
    useEffect(() => {
        if (params?.fichaId) {
            setFichaIdEditar(params.fichaId);
            setVista('editor');
        } else if (params?.nueva) {
            setFichaIdEditar(undefined);
            setVista('editor');
        }
    }, [params]);

    const cargarFichas = async () => {
        setCargando(true);
        try {
            const data = await apiFichas.getFichasEstampacion();
            if (Array.isArray(data)) {
                setFichas(data.map(dbToRecord));
            } else {
                console.error('Datos inválidos recibidos:', data);
                setFichas([]);
            }
        } catch (e) {
            console.error('Error cargando fichas estampacion:', e);
            setFichas([]);
        } finally {
            setCargando(false);
        }
    };

    const handleNavInterna = (tab: string, p?: any) => {
        if (tab === 'fichas-estampacion') {
            setVista('historico');
            setFichaIdEditar(undefined);
            cargarFichas(); // refrescar al volver al histórico
        } else if (tab === 'ficha-estampacion-editor') {
            setFichaIdEditar(p?.fichaId);
            setVista('editor');
        } else {
            onNavigate(tab, p);
        }
    };

    const handleGuardar = async (record: FichaEstampacionRecord) => {
        const payload = recordToDb(record, user?.name || '');
        const existe = fichas.find(f => f.id === record.id);

        try {
            let resultado;
            if (existe) {
                resultado = await apiFichas.updateFichaEstampacion(record.id, payload);
            } else {
                resultado = await apiFichas.createFichaEstampacion(payload);
            }
            
            if (resultado.success) {
                // Recargar fichas después de guardar
                await cargarFichas();
                handleNavInterna('fichas-estampacion');
            } else {
                console.error('Error guardando ficha:', resultado.message);
                alert(`Error al guardar: ${resultado.message || 'Error desconocido'}`);
            }
        } catch (e) {
            console.error('Error guardando ficha estampacion:', e);
            alert('Error al guardar la ficha. Intenta de nuevo.');
        }
    };

    const handleEliminar = async (id: string) => {
        try {
            const resultado = await apiFichas.deleteFichaEstampacion(id);
            if (resultado.success) {
                setFichas(prev => prev.filter(f => f.id !== id));
            } else {
                console.error('Error eliminando ficha:', resultado.message);
                alert(`Error al eliminar: ${resultado.message || 'Error desconocido'}`);
            }
        } catch (e) {
            console.error('Error eliminando ficha estampacion:', e);
            alert('Error al eliminar la ficha.');
        }
    };

    if (vista === 'editor') {
        return (
            <FichaEstampacionEditor
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
        <HistoricoFichasEstampacion
            user={user}
            onNavigate={handleNavInterna}
            fichas={fichas}
            onEliminar={handleEliminar}
            cargando={cargando}
        />
    );
};

export default FichaEstampacionContainer;
