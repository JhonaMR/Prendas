// ============================================
// TYPES: Sistema de Fichas
// Definiciones TypeScript
// ============================================

// ===== TIPOS BASE =====

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
  tipo?: 'TELA' | 'RESORTE' | 'INSUMO' | 'OTRO'; // Solo para materia prima
  um: string; // Unidad de medida
  vlr_unit: number; // Valor unitario
  cant: number; // Cantidad
  total: number; // vlr_unit * cant
}

// ===== FICHAS DE DISEÑO =====

export interface FichaDiseno {
  id: string;
  referencia: string;
  disenadoraId: string;
  disenadoraNombre?: string;
  
  // Metadata
  descripcion: string;
  marca: string;
  novedad: string;
  muestra1: string;
  muestra2: string;
  observaciones: string;
  
  // Fotos
  foto1: string | null;
  foto2: string | null;
  
  // Secciones
  materiaPrima: ConceptoFicha[];
  manoObra: ConceptoFicha[];
  insumosDirectos: ConceptoFicha[];
  insumosIndirectos: ConceptoFicha[];
  provisiones: ConceptoFicha[];
  
  // Totales
  totalMateriaPrima: number;
  totalManoObra: number;
  totalInsumosDirectos: number;
  totalInsumosIndirectos: number;
  totalProvisiones: number;
  costoTotal: number;
  
  // Control
  importada: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ===== FICHAS DE COSTO =====

export interface FichaCosto {
  id: string;
  referencia: string;
  fichaDisenoId: string | null;
  disenadoraId?: string;
  disenadoraNombre?: string;
  
  // Metadata (igual que diseño)
  descripcion: string;
  marca: string;
  novedad: string;
  muestra1: string;
  muestra2: string;
  observaciones: string;
  
  foto1: string | null;
  foto2: string | null;
  
  // Secciones (igual que diseño)
  materiaPrima: ConceptoFicha[];
  manoObra: ConceptoFicha[];
  insumosDirectos: ConceptoFicha[];
  insumosIndirectos: ConceptoFicha[];
  provisiones: ConceptoFicha[];
  
  // Totales
  totalMateriaPrima: number;
  totalManoObra: number;
  totalInsumosDirectos: number;
  totalInsumosIndirectos: number;
  totalProvisiones: number;
  costoTotal: number;
  
  // ADICIONALES de costo
  precioVenta: number;
  rentabilidad: number; // Porcentaje
  margenGanancia: number;
  costoContabilizar: number;
  
  // Descuentos
  desc0Precio: number;
  desc0Rent: number;
  desc5Precio: number;
  desc5Rent: number;
  desc10Precio: number;
  desc10Rent: number;
  desc15Precio: number;
  desc15Rent: number;
  
  // Cortes
  cantidadTotalCortada: number;
  numCortes?: number;
  cortes?: Corte[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ===== CORTES =====

export interface Corte {
  id: string;
  numeroCorte: number;
  fechaCorte: string;
  cantidadCortada: number;
  
  // Snapshot completo (igual que ficha_costo)
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
  
  // Utilidad vs proyectado
  costoProyectado: number;
  diferencia: number;
  margenUtilidad: number;
  
  createdBy: string;
  createdAt: string;
}

// ===== MALETAS =====

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

// ===== APP STATE =====

export interface AppState {
  users: User[];
  clients: Client[];
  confeccionistas: Confeccionista[];
  references: Reference[];
  receptions: BatchReception[];
  dispatches: Dispatch[];
  sellers: Seller[];
  correrias: Correria[];
  orders: Order[];
  productionTracking: ProductionTracking[];
  deliveryDates: DeliveryDate[];
  
  // NUEVOS
  disenadoras: Disenadora[];
  fichasDiseno: FichaDiseno[];
  fichasCosto: FichaCosto[];
  maletas: Maleta[];
}

// ===== TIPOS AUXILIARES =====

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

// ===== ENUMS ADICIONALES =====

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

// ===== RE-EXPORTAR TIPOS EXISTENTES =====
// (Para no romper imports existentes)

export * from './types'; // Tus types actuales
