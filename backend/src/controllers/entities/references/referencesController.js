/**
 * Controlador para operaciones CRUD de References
 * Maneja las rutas HTTP y validación de entrada
 */

const {
  validateCreateReference,
  validateUpdateReference,
  validateReferenceId
} = require('./referencesValidator');
const {
  getAllReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
  getReferencesByCorreria
} = require('./referencesService');
const logger = require('../../shared/logger');

/**
 * GET /api/references
 * Obtiene todas las referencias
 */
const list = (req, res) => {
  try {
    const references = getAllReferences();
    return res.json({
      success: true,
      data: references
    });
  } catch (error) {
    logger.error('Error listing references', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing references'
    });
  }
};

/**
 * GET /api/references/:id
 * Obtiene una referencia específica
 */
const read = (req, res) => {
  try {
    const { id } = req.params;
    validateReferenceId(id);

    const reference = getReferenceById(id);
    return res.json({
      success: true,
      data: reference
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error reading reference', error);
    return res.status(500).json({
      success: false,
      message: 'Error reading reference'
    });
  }
};

/**
 * POST /api/references
 * Crea una nueva referencia
 */
const create = (req, res) => {
  try {
    validateCreateReference(req.body);

    const reference = createReference(req.body);
    return res.status(201).json({
      success: true,
      data: reference,
      message: 'Reference created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    logger.error('Error creating reference', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating reference'
    });
  }
};

/**
 * PUT /api/references/:id
 * Actualiza una referencia existente
 */
const update = (req, res) => {
  try {
    const { id } = req.params;
    validateReferenceId(id);
    validateUpdateReference(req.body);

    const reference = updateReference(id, req.body);
    return res.json({
      success: true,
      data: reference,
      message: 'Reference updated successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error updating reference', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating reference'
    });
  }
};

/**
 * DELETE /api/references/:id
 * Elimina una referencia
 */
const delete_ = (req, res) => {
  try {
    const { id } = req.params;
    validateReferenceId(id);

    deleteReference(id);
    return res.json({
      success: true,
      message: 'Reference deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error deleting reference', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting reference'
    });
  }
};

/**
 * GET /api/references/correria/:correria_id
 * Obtiene todas las referencias de una correría
 */
const getCorreriaReferences = (req, res) => {
  try {
    const { correria_id } = req.params;

    const references = getReferencesByCorreria(correria_id);
    return res.json({
      success: true,
      data: references
    });
  } catch (error) {
    logger.error('Error getting correria references', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting correria references'
    });
  }
};

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_,
  getCorreriaReferences
};
