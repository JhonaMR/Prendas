
export interface SalesKPIs {
  cantReferencias: number;
  referenciasCero: number;
  porcentajeCero: number;
  ventasTotalesUnd: number;
  despachosTotalesUnd: number;
  porcentajeDespacho: number;
  ventasTotalesPesos: number;
  valorDespachoPrecioLista: number;
  despachosRealesReal: number;
  diferenciaPesos: number;
  porcentajeDiferencia: number;
}

export interface VendorPerformance {
  nombre: string;
  pedidos: number;
  undVendidas: number;
  undDespachadas: number;
  porcentajeSobreVenta: number;
  valorVendido: number;
  valorDespachado: number;
  valorPrecioLista: number;
  porcentajeDiferencia: number;
  cumplimientoUnd: number;
  cumplimientoVlr: number;
  vlrDifVentaDesp: number;
  descuentos?: number;
}

export interface DesignerPerformance {
  nombre: string;
  ventas: number;
  refCreadas: number;
  refVendidas: number;
  porcentajePedidas: number;
  refEnCero: number;
  porcentajeEnCero: number;
}

export interface ProductionItem {
  id: string;
  tercero: string;
  referencia: string;
  cantidad: number;
  fechaEnvio: string;
  fechaPresupuestada: string;
  fechaEntrega?: string;
  proceso: string;
  observacion: string;
}

export interface CostLineItem {
  id: string;
  concepto: string;
  unidad: string;
  valorUnidad: number;
  cantidad: number;
  total: number;
  nota?: string;
}

export interface CutInfo {
  id: string;
  isSettled?: boolean;
  numeroFicha: string;
  fechaCorte: string;
  cantidadCortada: number;
  materiaPrima: CostLineItem[];
  manoDeObra: CostLineItem[];
  insumosDirectos: CostLineItem[];
  insumosIndirectos: CostLineItem[];
  provisiones: CostLineItem[];
}

export interface CostSheet {
  id: string;
  referencia: string;
  marca: string;
  coleccion: string;
  disenadora: string;
  nombrePrenda: string;
  descripcionPrenda: string;
  telaPrincipal: string;
  novedadOCorreria: string;
  fotoUrl?: string;
  observaciones: string;
  muestras: string[];
  
  // Initial Projection Sections
  materiaPrima: CostLineItem[];
  manoDeObra: CostLineItem[];
  insumosDirectos: CostLineItem[];
  insumosIndirectos: CostLineItem[];
  provisiones: CostLineItem[];
  
  // Cuts
  cortes: CutInfo[];
  
  // Financials
  precioVenta: number;
  margenRentabilidad: number;
}

export interface CorreriaReport {
  id: string;
  nombre: string;
  año: number;
  kpis: SalesKPIs;
  vendedores: VendorPerformance[];
  disenadoras: DesignerPerformance[];
}

export interface ComparativeDashboardData {
  añoSeleccionado: number;
  correrias: CorreriaReport[];
  resumenAnual: {
    ventasTotales: number;
    despachosTotales: number;
    cumplimientoGlobal: number;
    unidadesPedidas: number;
    unidadesDespachadas: number;
  };
}

export interface DashboardData {
  comparativo: ComparativeDashboardData;
}

export interface InventorySummary {
  totalVendidas: number;
  stock: number;
  cortadas: number;
  programadas: number;
  pendiente: number;
  faltanDespachar: number;
}

export interface InventoryItem {
  id: string;
  cliente: string;
  direccion: string;
  cantidad: number;
  precio: number;
  undDespachadas: number;
  fvOficial: string;
  remiMl: string;
  vendedor: string;
}
