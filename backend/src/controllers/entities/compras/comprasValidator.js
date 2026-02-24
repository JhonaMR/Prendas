/**
 * Validador para Compras
 */

const validateCreateCompra = (data) => {
  const errors = [];

  // Campos requeridos
  if (!data.fecha) {
    errors.push('Fecha es requerida');
  }
  if (!data.insumo || data.insumo.trim() === '') {
    errors.push('Insumo es requerido');
  }
  if (data.cantidadInsumo === undefined || data.cantidadInsumo === null || data.cantidadInsumo === '') {
    errors.push('Cantidad Insumo es requerida');
  }
  if (!data.proveedor || data.proveedor.trim() === '') {
    errors.push('Proveedor es requerido');
  }

  // Validar que cantidadInsumo sea un número positivo
  if (data.cantidadInsumo !== undefined && data.cantidadInsumo !== null && data.cantidadInsumo !== '') {
    if (isNaN(data.cantidadInsumo) || data.cantidadInsumo <= 0) {
      errors.push('Cantidad Insumo debe ser un número positivo');
    }
  }

  // Validar campos numéricos opcionales
  if (data.unidades !== undefined && data.unidades !== null && data.unidades !== '') {
    if (isNaN(data.unidades) || data.unidades <= 0) {
      errors.push('Unidades debe ser un número positivo');
    }
  }

  if (data.precioUnidad !== undefined && data.precioUnidad !== null && data.precioUnidad !== '') {
    if (isNaN(data.precioUnidad) || data.precioUnidad < 0) {
      errors.push('Precio Unitario debe ser un número no negativo');
    }
  }

  if (data.cantidadTotal !== undefined && data.cantidadTotal !== null && data.cantidadTotal !== '') {
    if (isNaN(data.cantidadTotal) || data.cantidadTotal < 0) {
      errors.push('Cantidad Total debe ser un número no negativo');
    }
  }

  if (data.total !== undefined && data.total !== null && data.total !== '') {
    if (isNaN(data.total) || data.total < 0) {
      errors.push('Total debe ser un número no negativo');
    }
  }

  // Validar precioRealInsumoUnd
  if (data.precioRealInsumoUnd) {
    const validStates = ['pendiente', 'ok', 'diferencia'];
    if (!validStates.includes(data.precioRealInsumoUnd)) {
      errors.push('Precio Real Insumo UND debe ser: pendiente, ok o diferencia');
    }
  }

  if (errors.length > 0) {
    const error = new Error('Validación fallida');
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }
};

const validateUpdateCompra = (data) => {
  const errors = [];

  // Validar campos numéricos si se proporcionan
  if (data.unidades !== undefined && data.unidades !== null && data.unidades !== '') {
    if (isNaN(data.unidades) || data.unidades <= 0) {
      errors.push('Unidades debe ser un número positivo');
    }
  }

  if (data.cantidadInsumo !== undefined && data.cantidadInsumo !== null && data.cantidadInsumo !== '') {
    if (isNaN(data.cantidadInsumo) || data.cantidadInsumo <= 0) {
      errors.push('Cantidad Insumo debe ser un número positivo');
    }
  }

  if (data.precioUnidad !== undefined && data.precioUnidad !== null && data.precioUnidad !== '') {
    if (isNaN(data.precioUnidad) || data.precioUnidad < 0) {
      errors.push('Precio Unitario debe ser un número no negativo');
    }
  }

  if (data.cantidadTotal !== undefined && data.cantidadTotal !== null && data.cantidadTotal !== '') {
    if (isNaN(data.cantidadTotal) || data.cantidadTotal < 0) {
      errors.push('Cantidad Total debe ser un número no negativo');
    }
  }

  if (data.total !== undefined && data.total !== null && data.total !== '') {
    if (isNaN(data.total) || data.total < 0) {
      errors.push('Total debe ser un número no negativo');
    }
  }

  // Validar precioRealInsumoUnd
  if (data.precioRealInsumoUnd) {
    const validStates = ['pendiente', 'ok', 'diferencia'];
    if (!validStates.includes(data.precioRealInsumoUnd)) {
      errors.push('Precio Real Insumo UND debe ser: pendiente, ok o diferencia');
    }
  }

  if (errors.length > 0) {
    const error = new Error('Validación fallida');
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }
};

const validateCompraId = (id) => {
  if (!id || id.trim() === '') {
    const error = new Error('ID de compra es requerido');
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateCompra,
  validateUpdateCompra,
  validateCompraId
};
