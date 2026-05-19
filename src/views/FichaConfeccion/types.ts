// ============================================
// TYPES: Ficha de Confección
// ============================================

export interface FilaMedida {
    label: string;
    xl: string;
    xxl: string;
    xxxl: string;
}

export interface FichaConfeccionData {
    // Identificación
    referencia: string;
    fechaEnvio: string;
    fechaEntrega: string;
    // Info básica
    linea: string;
    marca: string;
    nMuestra: string;
    nCorte: string;
    // Precios
    precioConfeccion: string;
    precioEmpaque: string;
    precioManualidad: string;
    cantidad: string;
    // Responsable
    fichaRealizadaPor: string;
    descripcion: string;
    // Foto seleccionada (1, 2 o 3)
    fotoSeleccionada: 1 | 2 | 3;
    // Texto de piezas DXF
    textoPiezas: string;
    // Tabla de medidas — tallas editables
    talla1: string;
    talla2: string;
    talla3: string;
    // Filas de medidas
    filasMedidas: FilaMedida[];
    // Combinación colores
    combinacionColores: string;
    // Confección (instrucciones)
    confeccion: string;
    // Nota verificar
    notaVerificar: string;
    // Consumo de sesgo
    consumoSesgo: string;
    // Nota final
    notaFinal: string;
    // Empaque toggle
    empaqueActivo: boolean;
}

export const FICHA_DEFAULT: FichaConfeccionData = {
    referencia: '',
    fechaEnvio: new Date().toLocaleDateString('es-CO'),
    fechaEntrega: '',
    linea: '',
    marca: '',
    nMuestra: '',
    nCorte: '',
    precioConfeccion: '',
    precioEmpaque: '',
    precioManualidad: '',
    cantidad: '',
    fichaRealizadaPor: '',
    descripcion: '',
    fotoSeleccionada: 1,
    textoPiezas: '',
    talla1: 'S',
    talla2: 'M',
    talla3: 'L',
    filasMedidas: [
        { label: 'Cargaderas', xl: '', xxl: '', xxxl: '' },
        { label: 'Elástico',   xl: '', xxl: '', xxxl: '' },
        { label: 'Cuello',     xl: '', xxl: '', xxxl: '' },
        { label: 'Amarres',    xl: '', xxl: '', xxxl: '' },
        { label: '',           xl: '', xxl: '', xxxl: '' },
        { label: '',           xl: '', xxl: '', xxxl: '' },
    ],
    combinacionColores: '',
    confeccion: '',
    notaVerificar: 'VERIFICAR TALLAS DE BLUSA TERMINADA CON INFORMACION DE LA FICHA\nHACER SIEMPRE CONTRAMUESTRA',
    consumoSesgo: '',
    notaFinal: 'CUADRAR LA MAQUINA PARA QUE LOS CUELLOS Y SISAS NO\nQUEDEN ARRUGADOS, RECOGIDOS O BOLERUDOS, QUE QUEDEN AL ACIENTO',
    empaqueActivo: false,
};

export interface FichaConfeccionRecord {
    id: string;
    referencia: string;
    cantidadCortada: string;
    fechaCreacion: string;
    realizadoPor: string;
    data: FichaConfeccionData;
}
