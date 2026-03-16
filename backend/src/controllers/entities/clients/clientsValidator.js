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

  // Validar NIT (opcional)
  if (data.nit) {
    const nitValidation = validateString(data.nit, 'NIT', 0, 50);
    if (!nitValidation.valid) errors.nit = nitValidation.error;
  }

  // Validar dirección (opcional)
  if (data.address) {
    const addressValidation = validateString(data.address, 'Address', 0, 255);
    if (!addressValidation.valid) errors.address = addressValidation.error;
  }

  // Validar ciudad (opcional)
  if (data.city) {
    const cityValidation = validateString(data.city, 'City', 0, 100);
    if (!cityValidation.valid) errors.city = cityValidation.error;
  }

  // Validar vendedor (sellerId o seller_id)
  const sellerId = data.sellerId || data.seller_id;
  if (!sellerId) {
    errors.sellerId = 'Seller ID is required';
  } else {
    const sellerValidation = validateString(sellerId, 'Seller ID', 1, 100);
    if (!sellerValidation.valid) errors.sellerId = sellerValidation.error;
  }

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
    const nitValidation = validateString(data.nit, 'NIT', 0, 50);
    if (!nitValidation.valid) errors.nit = nitValidation.error;
  }

  if (data.address !== undefined) {
    const addressValidation = validateString(data.address, 'Address', 0, 255);
    if (!addressValidation.valid) errors.address = addressValidation.error;
  }

  if (data.city !== undefined) {
    const cityValidation = validateString(data.city, 'City', 0, 100);
    if (!cityValidation.valid) errors.city = cityValidation.error;
  }

  // Validar sellerId o seller_id
  const sellerId = data.sellerId || data.seller_id;
  if (sellerId !== undefined) {
    const sellerValidation = validateString(sellerId, 'Seller ID', 1, 100);
    if (!sellerValidation.valid) errors.sellerId = sellerValidation.error;
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
