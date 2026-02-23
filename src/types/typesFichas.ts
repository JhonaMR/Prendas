// ============================================
// TYPES: Sistema de Fichas
// ============================================

export interface Disenadora {
    id: string;
    nombre: string;
    cedula: string | null;
    telefono: string | null;
    activa: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ConceptoFicha {
    concepto: string;
    tipo?: 'TELA' | 'RESORTE' | 'INSUMO' | 'OTRO';
    um: string;
    vlr_unit: number;
    cant: number;
    total: number;
}

export interface FichaDiseno {
    id: string;
    referencia: string;
    disenadoraId: string;
    disenadoraNombre?: string;
    descripcion: string;
    marca: string;
    novedad: string;
    muestra1: string;
    muestra2: string;
    observaciones: string;
    foto1: string | null;
    foto2: string | null;
    materiaPrima: ConceptoFicha[];
    manoObra: ConceptoFicha[];
    insumosDirectos: ConceptoFicha[];
    insumosIndirectos: ConceptoFicha[];
    provisiones: ConceptoFicha[];
    totalMateriaPrima: number;
    totalManoObra: number;
    totalInsumosDirectos: number;
    totalInsumosIndirectos: number;
    totalProvisiones: number;
    costoTotal: number;
    importada: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface FichaCosto {
    id: string;
    referencia: string;
    fichaDisenoId: string | null;
    disenadoraId?: string;
    disenadoraNombre?: string;
    descripcion: string;
    marca: string;
    novedad: string;
    muestra1: string;
    muestra2: string;
    observaciones: string;
    foto1: string | null;
    foto2: string | null;
    materiaPrima: ConceptoFicha[];
    manoObra: ConceptoFicha[];
    insumosDirectos: ConceptoFicha[];
    insumosIndirectos: ConceptoFicha[];
    provisiones: ConceptoFicha[];
    totalMateriaPrima: number;
    totalManoObra: number;
    totalInsumosDirectos: number;
    totalInsumosIndirectos: number;
    totalProvisiones: number;
    costoTotal: number;
    precioVenta: number;
    rentabilidad: number;
    margenGanancia: number;
    costoContabilizar: number;
    desc0Precio: number;
    desc0Rent: number;
    desc5Precio: number;
    desc5Rent: number;
    desc10Precio: number;
    desc10Rent: number;
    desc15Precio: number;
    desc15Rent: number;
    cantidadTotalCortada: number;
    numCortes?: number;
    cortes?: Corte[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Corte {
    id: string;
    numeroCorte: number;
    fechaCorte: string;
    cantidadCortada: number;
    materiaPrima: ConceptoFicha[];
    manoObra: ConceptoFicha[];
    insumosDirectos: ConceptoFicha[];
    insumosIndirectos: ConceptoFicha[];
    provisiones: ConceptoFicha[];
    totalMateriaPrima: number;
    totalManoObra: number;
    totalInsumosDirectos: number;
    totalInsumosIndirectos: number;
    totalProvisiones: number;
    costoReal: number;
    precioVenta: number;
    rentabilidad: number;
    costoProyectado: number;
    diferencia: number;
    margenUtilidad: number;
    createdBy: string;
    createdAt: string;
}

export interface Maleta {
    id: string;
    nombre: string;
    correriaId: string | null;
    correriaNombre?: string;
    correriaYear?: number;
    numReferencias: number;
    referencias?: ReferenciaEnMaleta[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReferenciaEnMaleta {
    referencia: string;
    descripcion: string;
    foto: string | null;
    orden: number;
}

export interface FichaFormData {
    referencia: string;
    disenadoraId?: string;
    descripcion: string;
    marca: string;
    novedad: string;
    muestra1: string;
    muestra2: string;
    observaciones: string;
    foto1: string | null;
    foto2: string | null;
    materiaPrima: ConceptoFicha[];
    manoObra: ConceptoFicha[];
    insumosDirectos: ConceptoFicha[];
    insumosIndirectos: ConceptoFicha[];
    provisiones: ConceptoFicha[];
}

export interface CorteFormData {
    numeroCorte: number;
    fechaCorte: string;
    cantidadCortada: number;
    materiaPrima: ConceptoFicha[];
    manoObra: ConceptoFicha[];
    insumosDirectos: ConceptoFicha[];
    insumosIndirectos: ConceptoFicha[];
    provisiones: ConceptoFicha[];
    precioVenta?: number;
    rentabilidad?: number;
}

export enum TipoMaterial {
    TELA = 'TELA',
    RESORTE = 'RESORTE',
    INSUMO = 'INSUMO',
    OTRO = 'OTRO'
}

export enum UnidadMedida {
    METRO = 'METRO',
    UNIDAD = 'UNIDAD',
    PRENDA = 'PRENDA',
    KILOGRAMO = 'KILOGRAMO'
}
