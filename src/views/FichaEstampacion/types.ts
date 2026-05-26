// ============================================
// TYPES: Ficha de Estampación
// ============================================

export interface PintaEstampado {
    label: string;
    fotoPath: string | null;
    isFromFicha?: boolean;
    fotoNum?: number; // 1, 2 o 3
}

export interface FichaEstampacionData {
    // Identificación
    referencia: string;
    fechaEnvio: string;
    fechaEntrega: string;
    
    // Info básica
    linea: string;
    marca: string;
    nMuestra: string;
    nCorte: string;
    cantidad: string;

    // Responsable y descripcion básica
    fichaRealizadaPor: string;
    descripcion: string;

    // Precios (JSONB array dinámico)
    precios: { concepto: string; valor: string }[];

    // Foto principal seleccionada (1, 2 o 3)
    fotoSeleccionada: 1 | 2 | 3;

    // Observaciones (JSONB array dinámico de strings)
    observaciones: string[];

    // Responsable (Ej: GLOBLO)
    responsable: string;

    // Pintas activo/inactivo toggle
    pintasActivo: boolean;

    // Pintas de estampado (JSONB array de variantes)
    pintas: PintaEstampado[];

    // Combinación de colores (JSONB tabla de 6 columnas y n filas)
    combinacionColores: string[][];
}

export const FICHA_ESTAMPACION_DEFAULT: FichaEstampacionData = {
    referencia: '',
    fechaEnvio: new Date().toLocaleDateString('es-CO'),
    fechaEntrega: '',
    linea: '',
    marca: '',
    nMuestra: '',
    nCorte: '',
    cantidad: '',
    fichaRealizadaPor: '',
    descripcion: '',
    
    // 2 precios por defecto
    precios: [
        { concepto: 'ESTAMPADO', valor: '' },
        { concepto: 'PEGADA APLIQUE', valor: '' }
    ],
    
    fotoSeleccionada: 1,
    
    // 3 observaciones por defecto
    observaciones: ['', '', ''],
    
    responsable: '',

    pintasActivo: true,
    
    // 2 pintas vacías por defecto (se puede subir hasta 4)
    pintas: [
        { label: '', fotoPath: null },
        { label: '', fotoPath: null }
    ],
    
    // Grid de 6 columnas y 5 filas vacías por defecto
    combinacionColores: Array(5).fill(null).map(() => Array(6).fill(''))
};

export interface FichaEstampacionRecord {
    id: string;
    referencia: string;
    cantidadCortada: string;
    fechaCreacion: string;
    realizadoPor: string;
    responsable: string;
    data: FichaEstampacionData;
}
