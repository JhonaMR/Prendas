// ============================================
// CONTENEDOR: Fichas de Confeccion
// Usa la BD via apiFichas — ya no localStorage
// ============================================

import React, { useState, useEffect } from 'react';
import { AppState } from '../../types';
import { FichaConfeccionRecord } from './types';
import apiFichas from '../../services/apiFichas';
import HistoricoFichasConfeccion from './HistoricoFichasConfeccion';
import FichaConfeccionEditor from './FichaConfeccionEditor';

interface Props {
    user: any;
    state: AppState;
    onNavigate: (tab: string, params?: any) => void;
    params?: any;
}

// Convierte el objeto plano de la BD al formato FichaConfeccionRecord que usa el editor
function dbToRecord(fc: any): FichaConfeccionRecord {
    return {
        id: fc.id,
        referencia: fc.referencia,
        cantidadCortada: fc.cantidad || '',
        fechaCreacion: fc.createdAt
            ? new Date(fc.createdAt).toLocaleDateString('es-CO')
            : '',
        realizadoPor: fc.fichaRealizadaPor || '',
        data: {
            referencia: fc.referencia,
            fechaEnvio: fc.fechaEnvio || '',
            fechaEntrega: fc.fechaEntrega || '',
            linea: '',
            marca: '',
            nMuestra: '',
            nCorte: fc.nCorte || '',
            cantidad: fc.cantidad || '',
            fichaRealizadaPor: fc.fichaRealizadaPor || '',
            descripcion: fc.descripcion || '',
            precioConfeccion: fc.precioConfeccion || '',
            precioEmpaque: fc.precioEmpaque || '200',
            empaqueActivo: fc.empaqueActivo ?? true,
            precioManualidad: fc.precioManualidad || '',
            fotoSeleccionada: (fc.fotoSeleccionada as 1 | 2 | 3) || 1,
            textoPiezas: fc.textoPiezas || '',
            talla1: fc.talla1 || 'S',
            talla2: fc.talla2 || 'M',
            talla3: fc.talla3 || 'L',
            filasMedidas: fc.filasMedidas || [
                { label: 'Cargaderas', xl: '', xxl: '', xxxl: '' },
                { label: 'Elastico',   xl: '', xxl: '', xxxl: '' },
                { label: 'Cuello',     xl: '', xxl: '', xxxl: '' },
                { label: 'Amarres',    xl: '', xxl: '', xxxl: '' },
                { label: '',           xl: '', xxl: '', xxxl: '' },
                { label: '',           xl: '', xxl: '', xxxl: '' },
            ],
            combinacionColores: fc.combinacionColores || '',
            confeccion: fc.confeccion || '',
            notaVerificar: fc.notaVerificar || 'VERIFICAR TALLAS DE BLUSA TERMINADA CON INFORMACION DE LA FICHA\nHACER SIEMPRE CONTRAMUESTRA',
            consumoSesgo: fc.consumoSesgo || '',
            notaFinal: fc.notaFinal || 'CUADRAR LA MAQUINA PARA QUE LOS CUELLOS Y SISAS NO\nQUEDEN ARRUGADOS, RECOGIDOS O BOLERUDOS, QUE QUEDEN AL ACIENTO',
        },
    };
}

// Convierte FichaConfeccionRecord al payload para la BD
function recordToDb(record: FichaConfeccionRecord, createdBy: string) {
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
        precioConfeccion: d.precioConfeccion,
        precioEmpaque: d.precioEmpaque,
        empaqueActivo: d.empaqueActivo,
        precioManualidad: d.precioManualidad,
        fotoSeleccionada: d.fotoSeleccionada,
        textoPiezas: d.textoPiezas,
        talla1: d.talla1,
        talla2: d.talla2,
        talla3: d.talla3,
        filasMedidas: d.filasMedidas,
        combinacionColores: d.combinacionColores,
        confeccion: d.confeccion,
        notaVerificar: d.notaVerificar,
        consumoSesgo: d.consumoSesgo,
        notaFinal: d.notaFinal,
        createdBy,
    };
}

const FichaConfeccionContainer: React.FC<Props> = ({ user, state, onNavigate, params }) => {
    const [fichas, setFichas] = useState<FichaConfeccionRecord[]>([]);
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
            const data = await apiFichas.getFichasConfeccion();
            if (Array.isArray(data)) {
                setFichas(data.map(dbToRecord));
            } else {
                console.error('Datos inválidos recibidos:', data);
                setFichas([]);
            }
        } catch (e) {
            console.error('Error cargando fichas confeccion:', e);
            setFichas([]);
        } finally {
            setCargando(false);
        }
    };

    const handleNavInterna = (tab: string, p?: any) => {
        if (tab === 'fichas-confeccion') {
            setVista('historico');
            setFichaIdEditar(undefined);
            cargarFichas(); // refrescar al volver al histórico
        } else if (tab === 'ficha-confeccion-editor') {
            setFichaIdEditar(p?.fichaId);
            setVista('editor');
        } else {
            onNavigate(tab, p);
        }
    };

    const handleGuardar = async (record: FichaConfeccionRecord) => {
        const payload = recordToDb(record, user?.name || '');
        const existe = fichas.find(f => f.id === record.id);

        try {
            let resultado;
            if (existe) {
                resultado = await apiFichas.updateFichaConfeccion(record.id, payload);
            } else {
                resultado = await apiFichas.createFichaConfeccion(payload);
            }
            
            if (resultado.success) {
                // Recargar fichas después de guardar
                await cargarFichas();
                handleNavInterna('fichas-confeccion');
            } else {
                console.error('Error guardando ficha:', resultado.message);
                alert(`Error al guardar: ${resultado.message || 'Error desconocido'}`);
            }
        } catch (e) {
            console.error('Error guardando ficha confeccion:', e);
            alert('Error al guardar la ficha. Intenta de nuevo.');
        }
    };

    const handleEliminar = async (id: string) => {
        try {
            const resultado = await apiFichas.deleteFichaConfeccion(id);
            if (resultado.success) {
                setFichas(prev => prev.filter(f => f.id !== id));
            } else {
                console.error('Error eliminando ficha:', resultado.message);
                alert(`Error al eliminar: ${resultado.message || 'Error desconocido'}`);
            }
        } catch (e) {
            console.error('Error eliminando ficha confeccion:', e);
            alert('Error al eliminar la ficha.');
        }
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
