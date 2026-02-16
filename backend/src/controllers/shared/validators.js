/**
 * Validadores centralizados reutilizables
 * Proporciona funciones de validación comunes para todas las entidades
 */

const { ValidationError } = require('./errorHandler');

/**
 * Valida que un campo requerido esté presente
 */
function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Valida que un valor sea de un tipo específico
 */
function validateType(value, expectedType, fieldName) {
  if (typeof value !== expectedType) {
    return { 
      valid: false, 
      error: `${fieldName} must be of type ${expectedType}, got ${typeof value}` 
    };
  }
  return { valid: true };
}

/**
 * Valida que un número esté dentro de un rango
 */
function validateRange(value, min, max, fieldName) {
  if (value < min || value > max) {
    return { 
      valid: false, 
      error: `${fieldName} must be between ${min} and ${max}` 
    };
  }
  return { valid: true };
}

/**
 * Valida que un valor esté en una lista de opciones permitidas
 */
function validateEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    return { 
      valid: false, 
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}` 
    };
  }
  return { valid: true };
}

/**
 * Valida que un valor sea un email válido
 */
function validateEmail(value, fieldName = 'Email') {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, error: `${fieldName} is not a valid email` };
  }
  return { valid: true };
}

/**
 * Valida que un valor sea un número
 */
function validateNumber(value, fieldName) {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  return { valid: true };
}

/**
 * Valida que un valor sea un string no vacío
 */
function validateString(value, fieldName, minLength = 1, maxLength = Infinity) {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (value.trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  return { valid: true };
}

/**
 * Valida que un ID sea válido (no vacío)
 */
function validateId(id, fieldName = 'ID') {
  const result = validateRequired(id, fieldName);
  if (!result.valid) return result;
  return validateString(id, fieldName, 1);
}

/**
 * Ejecuta múltiples validaciones y retorna todos los errores
 */
function validateMultiple(validations) {
  const errors = {};
  
  for (const [fieldName, validationFn] of Object.entries(validations)) {
    const result = validationFn();
    if (!result.valid) {
      errors[fieldName] = result.error;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

module.exports = {
  validateRequired,
  validateType,
  validateRange,
  validateEnum,
  validateEmail,
  validateNumber,
  validateString,
  validateId,
  validateMultiple
};
