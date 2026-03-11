import { DashboardData, CorreriaReport } from './types';

const generateMockCorreria = (nombre: string, año: number): CorreriaReport => {
  const ventas = Math.floor(Math.random() * 100000000) + 100000000;
  const despachos = Math.floor(ventas * 0.75);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    nombre,
    año,
    kpis: {
      cantReferencias: 120 + Math.floor(Math.random() * 50),
      referenciasCero: 15 + Math.floor(Math.random() * 10),
      porcentajeCero: 14,
      ventasTotalesUnd: 8000 + Math.floor(Math.random() * 2000),
      despachosTotalesUnd: 6000 + Math.floor(Math.random() * 1000),
      porcentajeDespacho: 77.7,
      ventasTotalesPesos: ventas,
      valorDespachoPrecioLista: ventas,
      despachosRealesReal: despachos,
      diferenciaPesos: ventas - despachos,
      porcentajeDiferencia: 28.1,
    },
    vendedores: [
      {
        nombre: "John Efrain Bolivar",
        pedidos: 1,
        undVendidas: 2256,
        undDespachadas: 2006,
        porcentajeSobreVenta: 24.4,
        valorVendido: Math.floor(ventas * 0.24),
        valorDespachado: Math.floor(ventas * 0.24 * 0.82),
        valorPrecioLista: Math.floor(ventas * 0.24),
        porcentajeDiferencia: 19.6,
        cumplimientoUnd: 88.9,
        cumplimientoVlr: 82.0,
        vlrDifVentaDesp: 9278400,
        descuentos: 1250000
      },
      {
        nombre: "Lina Pulgarin",
        pedidos: 14,
        undVendidas: 4333,
        undDespachadas: 3403,
        porcentajeSobreVenta: 53.7,
        valorVendido: Math.floor(ventas * 0.53),
        valorDespachado: Math.floor(ventas * 0.53 * 0.79),
        valorPrecioLista: Math.floor(ventas * 0.53),
        porcentajeDiferencia: 0.4,
        cumplimientoUnd: 78.5,
        cumplimientoVlr: 79.0,
        vlrDifVentaDesp: 456000,
        descuentos: 850000
      },
      {
        nombre: "Raul Gonzalez",
        pedidos: 6,
        undVendidas: 1694,
        undDespachadas: 1028,
        porcentajeSobreVenta: 22.0,
        valorVendido: Math.floor(ventas * 0.22),
        valorDespachado: Math.floor(ventas * 0.22 * 0.77),
        valorPrecioLista: Math.floor(ventas * 0.22),
        porcentajeDiferencia: 0.4,
        cumplimientoUnd: 60.7,
        cumplimientoVlr: 77.0,
        vlrDifVentaDesp: 156000,
        descuentos: 420000
      }
    ],
    disenadoras: [
      {
        nombre: "MARTHA RAMIREZ",
        ventas: Math.floor(ventas * 0.46),
        refCreadas: 58,
        refVendidas: 45,
        porcentajePedidas: 78,
        refEnCero: 13,
        porcentajeEnCero: 22
      }
    ]
  };
};

export const mockDashboardData: DashboardData = {
  comparativo: {
    añoSeleccionado: 2026,
    correrias: [
      generateMockCorreria("Inicio de año 2026", 2026),
      generateMockCorreria("Madres 2026", 2026),
      generateMockCorreria("Padres 2026", 2026),
      generateMockCorreria("Vacaciones 2026", 2026),
    ],
    resumenAnual: {
      ventasTotales: 850000000,
      despachosTotales: 620000000,
      cumplimientoGlobal: 72.9,
      unidadesPedidas: 35000,
      unidadesDespachadas: 26000
    }
  }
};
