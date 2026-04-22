const { validateString, validateId } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

function validateCreateTransportista(data) {
  const errors = {};
  const idV = validateId(data.id, 'ID');
  if (!idV.valid) errors.id = idV.error;
  const nameV = validateString(data.nombre, 'Nombre', 1, 255);
  if (!nameV.valid) errors.nombre = nameV.error;
  
  // Validar tipo de vehículo
  if (data.tipoVehiculo && !['moto', 'carro'].includes(data.tipoVehiculo)) {
    errors.tipoVehiculo = 'Tipo de vehículo debe ser "moto" o "carro"';
  }
  
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

function validateUpdateTransportista(data) {
  const errors = {};
  if (data.nombre !== undefined) {
    const v = validateString(data.nombre, 'Nombre', 1, 255);
    if (!v.valid) errors.nombre = v.error;
  }
  
  // Validar tipo de vehículo si se proporciona
  if (data.tipoVehiculo !== undefined && !['moto', 'carro'].includes(data.tipoVehiculo)) {
    errors.tipoVehiculo = 'Tipo de vehículo debe ser "moto" o "carro"';
  }
  
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

function validateTransportistaId(id) {
  const v = validateId(id, 'Transportista ID');
  if (!v.valid) throw new ValidationError({ id: v.error });
}

module.exports = { validateCreateTransportista, validateUpdateTransportista, validateTransportistaId };
