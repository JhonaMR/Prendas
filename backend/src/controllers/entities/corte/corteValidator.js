// Validar creación de registro
exports.validateCreateCorte = (req, res, next) => {
  const { numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = req.body;
  const errors = [];

  // Validar numeroFicha
  if (!numeroFicha || typeof numeroFicha !== 'string' || numeroFicha.trim().length === 0) {
    errors.push('Número de ficha es requerido');
  } else if (numeroFicha.length > 50) {
    errors.push('Número de ficha debe tener máximo 50 caracteres');
  }

  // Validar fechaCorte
  if (!fechaCorte) {
    errors.push('Fecha de corte es requerida');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaCorte)) {
    errors.push('Fecha de corte debe estar en formato YYYY-MM-DD');
  }

  // Validar referencia
  if (!referencia || typeof referencia !== 'string' || referencia.trim().length === 0) {
    errors.push('Referencia es requerida');
  } else if (referencia.length > 50) {
    errors.push('Referencia debe tener máximo 50 caracteres');
  }

  // Validar descripcion (opcional)
  if (descripcion && typeof descripcion === 'string' && descripcion.length > 255) {
    errors.push('Descripción no puede exceder 255 caracteres');
  }

  // Validar cantidadCortada
  if (cantidadCortada === undefined || cantidadCortada === null) {
    errors.push('Cantidad cortada es requerida');
  } else if (!Number.isInteger(Number(cantidadCortada)) || Number(cantidadCortada) < 0) {
    errors.push('Cantidad cortada debe ser un número entero positivo');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validar actualización de registro
exports.validateUpdateCorte = (req, res, next) => {
  const { numeroFicha, fechaCorte, referencia, descripcion, cantidadCortada } = req.body;
  const errors = [];

  // Validar numeroFicha (opcional)
  if (numeroFicha !== undefined) {
    if (typeof numeroFicha !== 'string' || numeroFicha.trim().length === 0) {
      errors.push('Número de ficha debe ser una cadena no vacía');
    } else if (numeroFicha.length > 50) {
      errors.push('Número de ficha debe tener máximo 50 caracteres');
    }
  }

  // Validar fechaCorte (opcional)
  if (fechaCorte !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(fechaCorte)) {
    errors.push('Fecha de corte debe estar en formato YYYY-MM-DD');
  }

  // Validar referencia (opcional)
  if (referencia !== undefined) {
    if (typeof referencia !== 'string' || referencia.trim().length === 0) {
      errors.push('Referencia debe ser una cadena no vacía');
    } else if (referencia.length > 50) {
      errors.push('Referencia debe tener máximo 50 caracteres');
    }
  }

  // Validar descripcion (opcional)
  if (descripcion !== undefined && typeof descripcion === 'string' && descripcion.length > 255) {
    errors.push('Descripción no puede exceder 255 caracteres');
  }

  // Validar cantidadCortada (opcional)
  if (cantidadCortada !== undefined) {
    if (!Number.isInteger(Number(cantidadCortada)) || Number(cantidadCortada) < 0) {
      errors.push('Cantidad cortada debe ser un número entero positivo');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
