/**
 * Validador para la entidad References (Productos/Prendas)
 * Valida reglas de negocio específicas de referencias
 */

const {
  validateRequired,
  validateString,
  validateNumber,
  validateId,
  validateMultiple
} = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

/**
 * Valida datos para crear una referencia
 */
function validateCreateReference(data) {
  const errors = {};

  // Validar ID
  const idValidation = validateId(data.id, 'ID');
  if (!idValidation.valid) errors.id = idValidation.error;

  // Validar descripción
  const descValidation = validateString(data.description, 'Description', 1, 255);
  if (!descValidation.valid) errors.description = descValidation.error;

  // Validar precio
  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else {
    const priceValidation = validateNumber(data.price, 'Price');
    if (!priceValidation.valid) {
      errors.price = priceValidation.error;
    } else if (data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
  }

  // Validar diseñador
  const designerValidation = validateString(data.designer, 'Designer', 1, 255);
  if (!designerValidation.valid) errors.designer = designerValidation.error;

  // Validar correrías (debe tener al menos una)
  if (!Array.isArray(data.correrias) || data.correrias.length === 0) {
    errors.correrias = 'At least one correria must be assigned';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida datos para actualizar una referencia
 */
function validateUpdateReference(data) {
  const errors = {};

  // Descripción es opcional pero si se proporciona debe ser válida
  if (data.description !== undefined) {
    const descValidation = validateString(data.description, 'Description', 1, 255);
    if (!descValidation.valid) errors.description = descValidation.error;
  }

  // Precio es opcional pero si se proporciona debe ser válido
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const priceNum = Number(data.price);
    const priceValidation = validateNumber(priceNum, 'Price');
    if (!priceValidation.valid) {
      errors.price = priceValidation.error;
    } else if (priceNum <= 0) {
      errors.price = 'Price must be greater than 0';
    }
  }

  // Diseñador es opcional pero si se proporciona debe ser válido
  if (data.designer !== undefined) {
    const designerValidation = validateString(data.designer, 'Designer', 1, 255);
    if (!designerValidation.valid) errors.designer = designerValidation.error;
  }

  // Correrías es opcional pero si se proporciona debe tener al menos una
  if (data.correrias !== undefined) {
    if (!Array.isArray(data.correrias) || data.correrias.length === 0) {
      errors.correrias = 'At least one correria must be assigned';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida que un ID de referencia sea válido
 */
function validateReferenceId(id) {
  const validation = validateId(id, 'Reference ID');
  if (!validation.valid) {
    throw new ValidationError({ id: validation.error });
  }
}

module.exports = {
  validateCreateReference,
  validateUpdateReference,
  validateReferenceId
};
