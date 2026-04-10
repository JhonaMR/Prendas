const { validateString, validateId } = require('../../shared/validators');
const { ValidationError } = require('../../shared/errorHandler');

function validateCreateTaller(data) {
  const errors = {};
  const idV = validateId(data.id, 'ID');
  if (!idV.valid) errors.id = idV.error;
  const nameV = validateString(data.nombre, 'Nombre', 1, 255);
  if (!nameV.valid) errors.nombre = nameV.error;
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

function validateUpdateTaller(data) {
  const errors = {};
  if (data.nombre !== undefined) {
    const v = validateString(data.nombre, 'Nombre', 1, 255);
    if (!v.valid) errors.nombre = v.error;
  }
  if (data.estado !== undefined && !['activo', 'inactivo'].includes(data.estado)) {
    errors.estado = 'Estado debe ser activo o inactivo';
  }
  if (Object.keys(errors).length > 0) throw new ValidationError(errors);
}

function validateTallerId(id) {
  const v = validateId(id, 'Taller ID');
  if (!v.valid) throw new ValidationError({ id: v.error });
}

module.exports = { validateCreateTaller, validateUpdateTaller, validateTallerId };
