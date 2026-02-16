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
