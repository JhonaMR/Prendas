/**
 * Validador para la entidad Correrias
 */

const { validateString, validateId, validateNumber, validateRange } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

function validateCreateCorreria(data) {
  const errors = {};

  const idValidation = validateId(data.id, 'ID');
  if (!idValidation.valid) errors.id = idValidation.error;

  const nameValidation = validateString(data.name, 'Name', 1, 255);
  if (!nameValidation.valid) errors.name = nameValidation.error;

  if (data.year === undefined || data.year === null) {
    errors.year = 'Year is required';
  } else {
    const yearValidation = validateNumber(data.year, 'Year');
    if (!yearValidation.valid) {
      errors.year = yearValidation.error;
    } else {
      const currentYear = new Date().getFullYear();
      const rangeValidation = validateRange(data.year, 1900, currentYear + 10, 'Year');
      if (!rangeValidation.valid) errors.year = rangeValidation.error;
    }
  }

  // Validar fecha_inicio si se proporciona
  if (data.fecha_inicio !== undefined && data.fecha_inicio !== null) {
    const fechaInicio = new Date(data.fecha_inicio);
    if (isNaN(fechaInicio.getTime())) {
      errors.fecha_inicio = 'Fecha inicio must be a valid date';
    }
  }

  // Validar fecha_fin si se proporciona
  if (data.fecha_fin !== undefined && data.fecha_fin !== null) {
    const fechaFin = new Date(data.fecha_fin);
    if (isNaN(fechaFin.getTime())) {
      errors.fecha_fin = 'Fecha fin must be a valid date';
    }
  }

  // Validar que fecha_fin sea posterior a fecha_inicio si ambas se proporcionan
  if (data.fecha_inicio && data.fecha_fin) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);
    if (fechaFin < fechaInicio) {
      errors.fecha_fin = 'Fecha fin must be after or equal to fecha inicio';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function validateUpdateCorreria(data) {
  const errors = {};

  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'Name', 1, 255);
    if (!nameValidation.valid) errors.name = nameValidation.error;
  }

  if (data.year !== undefined) {
    const yearValidation = validateNumber(data.year, 'Year');
    if (!yearValidation.valid) {
      errors.year = yearValidation.error;
    } else {
      const currentYear = new Date().getFullYear();
      const rangeValidation = validateRange(data.year, 1900, currentYear + 10, 'Year');
      if (!rangeValidation.valid) errors.year = rangeValidation.error;
    }
  }

  // Validar fecha_inicio si se proporciona
  if (data.fecha_inicio !== undefined && data.fecha_inicio !== null) {
    const fechaInicio = new Date(data.fecha_inicio);
    if (isNaN(fechaInicio.getTime())) {
      errors.fecha_inicio = 'Fecha inicio must be a valid date';
    }
  }

  // Validar fecha_fin si se proporciona
  if (data.fecha_fin !== undefined && data.fecha_fin !== null) {
    const fechaFin = new Date(data.fecha_fin);
    if (isNaN(fechaFin.getTime())) {
      errors.fecha_fin = 'Fecha fin must be a valid date';
    }
  }

  // Validar que fecha_fin sea posterior a fecha_inicio si ambas se proporcionan
  if (data.fecha_inicio && data.fecha_fin) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);
    if (fechaFin < fechaInicio) {
      errors.fecha_fin = 'Fecha fin must be after or equal to fecha inicio';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function validateCorrieriaId(id) {
  const validation = validateId(id, 'Correria ID');
  if (!validation.valid) {
    throw new ValidationError({ id: validation.error });
  }
}

module.exports = {
  validateCreateCorreria,
  validateUpdateCorreria,
  validateCorrieriaId
};
