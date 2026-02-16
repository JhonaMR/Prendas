/**
 * Manejador centralizado de errores
 * Define clases de error estándar y middleware de manejo
 */

const logger = require('./logger');

/**
 * Error de validación
 */
class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

/**
 * Error de recurso no encontrado
 */
class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.entity = entity;
    this.id = id;
    this.statusCode = 404;
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = 500;
  }
}

/**
 * Error genérico de servidor
 */
class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware en Express
 */
function errorHandler(err, req, res, next) {
  logger.error(`Error en ${req.method} ${req.path}`, err, {
    body: req.body,
    params: req.params
  });

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: 'Database error occurred'
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}

module.exports = {
  ValidationError,
  NotFoundError,
  DatabaseError,
  ServerError,
  errorHandler
};
