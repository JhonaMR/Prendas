/**
 * Validador para la entidad Sellers (Vendedores)
 */

const { validateString, validateId } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

function validateCreateSeller(data) {
  const errors = {};

  const idValidation = validateId(data.id, 'ID');
  if (!idValidation.valid) errors.id = idValidation.error;

  const nameValidation = validateString(data.name, 'Name', 1, 255);
  if (!nameValidation.valid) errors.name = nameValidation.error;

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function validateUpdateSeller(data) {
  const errors = {};

  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'Name', 1, 255);
    if (!nameValidation.valid) errors.name = nameValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

function validateSellerId(id) {
  const validation = validateId(id, 'Seller ID');
  if (!validation.valid) {
    throw new ValidationError({ id: validation.error });
  }
}

module.exports = {
  validateCreateSeller,
  validateUpdateSeller,
  validateSellerId
};
