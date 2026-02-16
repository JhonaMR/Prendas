/**
 * Validador para la entidad Confeccionistas
 */

const {
  validateString,
  validateId,
  validateEnum
} = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

const VALID_SCORES = ['A', 'AA', 'AAA', 'NA'];

/**
 * Valida datos para crear un confeccionista
 */
function validateCreateConfeccionista(data) {
  const errors = {};

  const idValidation = validateId(data.id, 'ID');
  if (!idValidation.valid) errors.id = idValidation.error;

  const nameValidation = validateString(data.name, 'Name', 1, 255);
  if (!nameValidation.valid) errors.name = nameValidation.error;

  const addressValidation = validateString(data.address, 'Address', 1, 255);
  if (!addressValidation.valid) errors.address = addressValidation.error;

  const cityValidation = validateString(data.city, 'City', 1, 100);
  if (!cityValidation.valid) errors.city = cityValidation.error;

  const phoneValidation = validateString(data.phone, 'Phone', 1, 20);
  if (!phoneValidation.valid) errors.phone = phoneValidation.error;

  const scoreValidation = validateEnum(data.score, VALID_SCORES, 'Score');
  if (!scoreValidation.valid) errors.score = scoreValidation.error;

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida datos para actualizar un confeccionista
 */
function validateUpdateConfeccionista(data) {
  const errors = {};

  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'Name', 1, 255);
    if (!nameValidation.valid) errors.name = nameValidation.error;
  }

  if (data.address !== undefined) {
    const addressValidation = validateString(data.address, 'Address', 1, 255);
    if (!addressValidation.valid) errors.address = addressValidation.error;
  }

  if (data.city !== undefined) {
    const cityValidation = validateString(data.city, 'City', 1, 100);
    if (!cityValidation.valid) errors.city = cityValidation.error;
  }

  if (data.phone !== undefined) {
    const phoneValidation = validateString(data.phone, 'Phone', 1, 20);
    if (!phoneValidation.valid) errors.phone = phoneValidation.error;
  }

  if (data.score !== undefined) {
    const scoreValidation = validateEnum(data.score, VALID_SCORES, 'Score');
    if (!scoreValidation.valid) errors.score = scoreValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida que un ID de confeccionista sea válido
 */
function validateConfeccionistaId(id) {
  const validation = validateId(id, 'Confeccionista ID');
  if (!validation.valid) {
    throw new ValidationError({ id: validation.error });
  }
}

module.exports = {
  validateCreateConfeccionista,
  validateUpdateConfeccionista,
  validateConfeccionistaId,
  VALID_SCORES
};
