/**
 * 📋 VALIDATION MIDDLEWARE
 * 
 * Middleware para validar requests contra esquemas Joi
 * Validación: Requirements 7.1
 */

/**
 * Middleware para validar body de request
 * @param {Joi.Schema} schema - Esquema de validación
 * @returns {Function} Middleware
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    // Reemplazar body con valores validados
    req.body = value;
    next();
  };
}

/**
 * Middleware para validar query parameters
 * @param {Joi.Schema} schema - Esquema de validación
 * @returns {Function} Middleware
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    // Reemplazar query con valores validados
    req.query = value;
    next();
  };
}

/**
 * Middleware para validar params
 * @param {Joi.Schema} schema - Esquema de validación
 * @returns {Function} Middleware
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    // Reemplazar params con valores validados
    req.params = value;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
