import { AppState, Order, Dispatch, Reference, Correria } from '../types';

export interface YearStats {
  cantReferencias: number;
  referenciasCero: number;
  porcentajeCero: number;
  ventasTotalesUnd: number;
  despachosTotalesUnd: number;
  porcentajeDespacho: number;
  ventasTotalesPesos: number;
  despachosRealesReal: number;
  diferenciaPesos: number;
  porcentajeDiferencia: number;
}

export interface VendorYearData {
  nombre: string;
  pedidos: number;
  undVendidas: number;
  undDespachadas: number;
  cumplimientoUnd: number;
  valorVendido: number;
  valorDespachado: number;
  cumplimientoVlr: number;
  descuentos: number;
}

export interface DesignerYearData {
  nombre: string;
  refCreadas: number;
  refVendidas: number;
  porcentajePedidas: number;
  refEnCero: number;
}

export function calculateYearStats(
  state: AppState,
  filteredCorrerias: Correria[],
  yearReferences: Reference[],
  yearOrders: Order[],
  yearDispatches: Dispatch[]
): YearStats {
  const refIds = yearReferences.map(r => r.id);

  // Total vendidas
  const totalVendidas = yearOrders.reduce((acc, order) => {
    return acc + order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  // Total despachadas
  const totalDespachadas = yearDispatches.reduce((acc, dispatch) => {
    return acc + dispatch.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  // Referencias vendidas
  const refsVendidas = refIds.filter(refId => 
    yearOrders.some(order => order.items.some(item => item.reference === refId && item.quantity > 0))
  ).length;

  const refsEnCero = yearReferences.length - refsVendidas;
  const porcentajeCero = yearReferences.length > 0 ? ((refsEnCero / yearReferences.length) * 100) : 0;

  // Cumplimiento unidades
  const porcentajeDespacho = totalVendidas > 0 ? ((totalDespachadas / totalVendidas) * 100) : 0;

  // Valores
  const totalVendidoValor = yearOrders.reduce((acc, order) => acc + order.totalValue, 0);
  
  const totalDespachadoValor = yearDispatches.reduce((acc, dispatch) => {
    return acc + dispatch.items.reduce((sum, item) => {
      return sum + (item.quantity * (item.salePrice || 0));
    }, 0);
  }, 0);

  const diferenciaPesos = totalVendidoValor - totalDespachadoValor;
  const porcentajeDiferencia = totalVendidoValor > 0 ? ((diferenciaPesos / totalVendidoValor) * 100) : 0;

  return {
    cantReferencias: yearReferences.length,
    referenciasCero: refsEnCero,
    porcentajeCero,
    ventasTotalesUnd: totalVendidas,
    despachosTotalesUnd: totalDespachadas,
    porcentajeDespacho,
    ventasTotalesPesos: totalVendidoValor,
    despachosRealesReal: totalDespachadoValor,
    diferenciaPesos,
    porcentajeDiferencia,
  };
}

export function calculateVendorData(
  state: AppState,
  filteredCorrerias: Correria[],
  yearReferences: Reference[],
  yearOrders: Order[],
  yearDispatches: Dispatch[]
): Map<string, Map<string, VendorYearData>> {
  // Map<vendorName, Map<correriaId, VendorYearData>>
  const vendorDataByCorreria = new Map<string, Map<string, VendorYearData>>();

  const refIds = yearReferences.map(r => r.id);

  // Para cada vendedor
  state.sellers.forEach(seller => {
    const vendorMap = new Map<string, VendorYearData>();

    // Para cada correría
    filteredCorrerias.forEach(correria => {
      const sellerOrdersInCorreria = yearOrders.filter(o => o.sellerId === seller.id && o.correriaId === correria.id);
      const clientIds = sellerOrdersInCorreria.map(o => o.clientId);
      const sellerDispatchesInCorreria = yearDispatches.filter(d => d.correriaId === correria.id && clientIds.includes(d.clientId));

      const undVendidas = sellerOrdersInCorreria.reduce((acc, order) => {
        return acc + order.items.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);

      const undDespachadas = sellerDispatchesInCorreria.reduce((acc, dispatch) => {
        return acc + dispatch.items.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);

      const valorVendido = sellerOrdersInCorreria.reduce((acc, order) => acc + order.totalValue, 0);

      const valorDespachado = sellerDispatchesInCorreria.reduce((acc, dispatch) => {
        return acc + dispatch.items.reduce((sum, item) => {
          return sum + (item.quantity * (item.salePrice || 0));
        }, 0);
      }, 0);

      const cumplimientoUnd = undVendidas > 0 ? ((undDespachadas / undVendidas) * 100) : 0;
      const cumplimientoVlr = valorVendido > 0 ? ((valorDespachado / valorVendido) * 100) : 0;
      const descuentos = valorVendido - valorDespachado;

      vendorMap.set(correria.id, {
        nombre: seller.name,
        pedidos: sellerOrdersInCorreria.length,
        undVendidas,
        undDespachadas,
        cumplimientoUnd,
        valorVendido,
        valorDespachado,
        cumplimientoVlr,
        descuentos,
      });
    });

    vendorDataByCorreria.set(seller.name, vendorMap);
  });

  return vendorDataByCorreria;
}

export function calculateDesignerData(
  state: AppState,
  filteredCorrerias: Correria[],
  yearReferences: Reference[],
  yearOrders: Order[]
): Map<string, Map<string, DesignerYearData>> {
  // Map<designerName, Map<correriaId, DesignerYearData>>
  const designerDataByCorreria = new Map<string, Map<string, DesignerYearData>>();

  const designers = [...new Set(yearReferences.map(r => r.designer).filter(Boolean))];

  designers.forEach(designer => {
    const designerMap = new Map<string, DesignerYearData>();

    filteredCorrerias.forEach(correria => {
      const designerRefsInCorreria = yearReferences.filter(r => r.designer === designer && r.correrias.includes(correria.id));
      const refIds = designerRefsInCorreria.map(r => r.id);

      const refVendidas = refIds.filter(refId => 
        yearOrders.some(order => order.items.some(item => item.reference === refId && item.quantity > 0))
      ).length;

      const refEnCero = designerRefsInCorreria.length - refVendidas;
      const porcentajePedidas = designerRefsInCorreria.length > 0 ? ((refVendidas / designerRefsInCorreria.length) * 100) : 0;

      designerMap.set(correria.id, {
        nombre: designer,
        refCreadas: designerRefsInCorreria.length,
        refVendidas,
        porcentajePedidas,
        refEnCero,
      });
    });

    designerDataByCorreria.set(designer, designerMap);
  });

  return designerDataByCorreria;
}
