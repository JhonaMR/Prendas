/**
 * Validador para la entidad Clients (Clientes)
 */

const {
  validateRequired,
  validateString,
  validateId,
  validateEmail
} = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

/**
 * Valida datos para crear un cliente
 */
function validateCreateClient(data) {
  const errors = {};

  // Validar ID
  const idValidation = validateId(data.id, 'ID');
  if (!idValidation.valid) errors.id = idValidation.error;

  // Validar nombre
  const nameValidation = validateString(data.name, 'Name', 1, 255);
  if (!nameValidation.valid) errors.name = nameValidation.error;

  // Validar NIT
  const nitValidation = validateString(data.nit, 'NIT', 1, 50);
  if (!nitValidation.valid) errors.nit = nitValidation.error;

  // Validar dirección
  const addressValidation = validateString(data.address, 'Address', 1, 255);
  if (!addressValidation.valid) errors.address = addressValidation.error;

  // Validar ciudad
  const cityValidation = validateString(data.city, 'City', 1, 100);
  if (!cityValidation.valid) errors.city = cityValidation.error;

  // Validar vendedor
  const sellerValidation = validateString(data.seller, 'Seller', 1, 100);
  if (!sellerValidation.valid) errors.seller = sellerValidation.error;

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida datos para actualizar un cliente
 */
function validateUpdateClient(data) {
  const errors = {};

  if (data.name !== undefined) {
    const nameValidation = validateString(data.name, 'Name', 1, 255);
    if (!nameValidation.valid) errors.name = nameValidation.error;
  }

  if (data.nit !== undefined) {
    const nitValidation = validateString(data.nit, 'NIT', 1, 50);
    if (!nitValidation.valid) errors.nit = nitValidation.error;
  }

  if (data.address !== undefined) {
    const addressValidation = validateString(data.address, 'Address', 1, 255);
    if (!addressValidation.valid) errors.address = addressValidation.error;
  }

  if (data.city !== undefined) {
    const cityValidation = validateString(data.city, 'City', 1, 100);
    if (!cityValidation.valid) errors.city = cityValidation.error;
  }

  if (data.seller !== undefined) {
    const sellerValidation = validateString(data.seller, 'Seller', 1, 100);
    if (!sellerValidation.valid) errors.seller = sellerValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Valida que un ID de cliente sea válido
 */
function validateClientId(id) {
  const validation = validateId(id, 'Client ID');
  if (!validation.valid) {
    throw new ValidationError({ id: validation.error });
  }
}

module.exports = {
  validateCreateClient,
  validateUpdateClient,
  validateClientId
};
