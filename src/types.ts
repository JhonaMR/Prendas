
export enum UserRole {
  GENERAL = 'general',
  admin = 'admin'
}

export interface User {
  id: string;
  name: string;
  loginCode: string; // 3 characters
  pin: string; // 4 digits
  role: UserRole;
}

export interface Seller {
  id: string;
  name: string;
}

export interface Correria {
  id: string;
  name: string;
  year: string;
}

export interface Client {
  id: string;
  name: string;
  nit: string; 
  address: string;
  city: string;
  seller: string;
}

export interface Confeccionista {
  id: string; // Cédula
  name: string;
  address: string;
  city: string;
  phone: string;
  score: string; // A, AA, AAA
  active: boolean;
}

export interface Reference {
  id: string; 
  description: string;
  price: number;
  designer: string;
  cloth1?: string;
  avgCloth1?: number;
  cloth2?: string;
  avgCloth2?: number;
  correrias: string[];
}

export interface ProductionTracking {
  refId: string;
  correriaId: string;
  programmed: number;
  cut: number;
}

export type ChargeType = 'Compra' | 'Cobro' | null;

export interface ItemEntry {
  reference: string;
  quantity: number;
}

export interface AuditLog {
  user: string;
  date: string;
}

export interface BatchReception {
  id: string;
  batchCode: string;
  confeccionista: string;
  hasSeconds: boolean | null;
  chargeType: ChargeType;
  chargeUnits: number;
  items: ItemEntry[];
  receivedBy: string;
  createdAt: string;
  editLogs: AuditLog[];
}

export interface Dispatch {
  id: string;
  clientId: string;
  correriaId: string; // ← AGREGAMOS ESTA LÍNEA
  invoiceNo: string;
  remissionNo: string;
  items: ItemEntry[];
  dispatchedBy: string;
  createdAt: string;
  editLogs: AuditLog[];
}

export interface Order {
  id: string;
  clientId: string;
  sellerId: string;
  correriaId: string;
  items: ItemEntry[];
  totalValue: number;
  createdAt: string;
  settledBy: string;
  orderNumber?: number;
}

export interface DeliveryDate {
  id: string;
  confeccionistaId: string;
  referenceId: string;
  quantity: number;
  sendDate: string;
  expectedDate: string;
  deliveryDate: string | null;
  process: string;
  observation: string;
  createdAt: string;
  createdBy: string;
}

export interface AppState {
  users: User[];
  clients: Client[];
  confeccionistas: Confeccionista[];
  references: Reference[];
  receptions: BatchReception[];
  returnReceptions?: any[];
  dispatches: Dispatch[];
  sellers: Seller[];
  correrias: Correria[];
  orders: Order[];
  productionTracking: ProductionTracking[];
  deliveryDates: DeliveryDate[];
}
