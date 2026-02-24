class InventoryMovementsValidator {
  validateCreate(data) {
    const errors = [];

    if (!data.insumo || typeof data.insumo !== 'string' || data.insumo.trim() === '') {
      errors.push('Insumo es requerido y debe ser texto');
    }

    if (data.cantidad === undefined || data.cantidad === null || isNaN(data.cantidad) || data.cantidad <= 0) {
      errors.push('Cantidad es requerida y debe ser mayor a 0');
    }

    if (data.valor_unitario === undefined || data.valor_unitario === null || isNaN(data.valor_unitario) || data.valor_unitario < 0) {
      errors.push('Valor unitario es requerido y debe ser mayor o igual a 0');
    }

    if (data.valor_total === undefined || data.valor_total === null || isNaN(data.valor_total) || data.valor_total < 0) {
      errors.push('Valor total es requerido y debe ser mayor o igual a 0');
    }

    if (!data.proveedor || typeof data.proveedor !== 'string' || data.proveedor.trim() === '') {
      errors.push('Proveedor es requerido y debe ser texto');
    }

    if (!data.movimiento || !['Entrada', 'Salida'].includes(data.movimiento)) {
      errors.push('Movimiento debe ser "Entrada" o "Salida"');
    }

    if (data.referencia_destino && typeof data.referencia_destino !== 'string') {
      errors.push('Referencia/Destino debe ser texto');
    }

    if (data.remision_factura && typeof data.remision_factura !== 'string') {
      errors.push('Remisión/Factura debe ser texto');
    }

    return errors;
  }

  validateUpdate(data) {
    const errors = [];

    if (data.insumo !== undefined) {
      if (typeof data.insumo !== 'string' || data.insumo.trim() === '') {
        errors.push('Insumo debe ser texto no vacío');
      }
    }

    if (data.cantidad !== undefined) {
      if (isNaN(data.cantidad) || data.cantidad <= 0) {
        errors.push('Cantidad debe ser mayor a 0');
      }
    }

    if (data.valor_unitario !== undefined) {
      if (isNaN(data.valor_unitario) || data.valor_unitario < 0) {
        errors.push('Valor unitario debe ser mayor o igual a 0');
      }
    }

    if (data.valor_total !== undefined) {
      if (isNaN(data.valor_total) || data.valor_total < 0) {
        errors.push('Valor total debe ser mayor o igual a 0');
      }
    }

    if (data.proveedor !== undefined) {
      if (typeof data.proveedor !== 'string' || data.proveedor.trim() === '') {
        errors.push('Proveedor debe ser texto no vacío');
      }
    }

    if (data.movimiento !== undefined) {
      if (!['Entrada', 'Salida'].includes(data.movimiento)) {
        errors.push('Movimiento debe ser "Entrada" o "Salida"');
      }
    }

    if (data.referencia_destino !== undefined && data.referencia_destino !== null) {
      if (typeof data.referencia_destino !== 'string') {
        errors.push('Referencia/Destino debe ser texto');
      }
    }

    if (data.remision_factura !== undefined && data.remision_factura !== null) {
      if (typeof data.remision_factura !== 'string') {
        errors.push('Remisión/Factura debe ser texto');
      }
    }

    return errors;
  }
}

module.exports = new InventoryMovementsValidator();
