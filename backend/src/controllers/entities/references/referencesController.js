/**
 * Controlador para operaciones CRUD de References - POSTGRESQL
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
const { bulkImportReferences } = require('../../../services/BulkReferenceImportService');
const { parseCSV } = require('../../../utils/csvParser');
const logger = require('../../shared/logger');

/**
 * GET /api/references
 * Obtiene todas las referencias
 */
const list = async (req, res) => {
  try {
    logger.info('Listing all references');
    const references = await getAllReferences();
    logger.info(`Retrieved ${references.length} references`);
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
const read = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Reading reference with id: ${id}`);
    validateReferenceId(id);

    const reference = await getReferenceById(id);
    logger.info(`Successfully retrieved reference: ${id}`);
    return res.json({
      success: true,
      data: reference
    });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`Reference not found: ${req.params.id}`);
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
const create = async (req, res) => {
  try {
    logger.info('Creating new reference', { body: req.body });
    validateCreateReference(req.body);

    const reference = await createReference(req.body);
    logger.info(`Reference created successfully with id: ${reference.id}`);
    return res.status(201).json({
      success: true,
      data: reference,
      message: 'Reference created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      logger.warn('Validation error creating reference', { errors: error.errors });
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
const update = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Updating reference with id: ${id}`, { body: req.body });
    validateReferenceId(id);
    validateUpdateReference(req.body);

    const reference = await updateReference(id, req.body);
    logger.info(`Reference updated successfully: ${id}`);
    return res.json({
      success: true,
      data: reference,
      message: 'Reference updated successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      logger.warn(`Validation error updating reference: ${req.params.id}`, { errors: error.errors });
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    if (error.statusCode === 404) {
      logger.warn(`Reference not found for update: ${req.params.id}`);
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
const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting reference with id: ${id}`);
    validateReferenceId(id);

    await deleteReference(id);
    logger.info(`Reference deleted successfully: ${id}`);
    return res.json({
      success: true,
      message: 'Reference deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      logger.warn(`Reference not found for deletion: ${req.params.id}`);
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
const getCorreriaReferences = async (req, res) => {
  try {
    const { correria_id } = req.params;
    logger.info(`Getting references for correria: ${correria_id}`);

    const references = await getReferencesByCorreria(correria_id);
    logger.info(`Retrieved ${references.length} references for correria: ${correria_id}`);
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

/**
 * POST /api/references/bulk-import
 * Importa referencias masivamente desde CSV
 */
const bulkImport = async (req, res) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({
        success: false,
        message: 'CSV content is required'
      });
    }

    // Parsear CSV
    const records = parseCSV(csvContent);

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid records found in CSV'
      });
    }

    // Importar referencias
    const result = await bulkImportReferences(records);

    return res.json(result);
  } catch (error) {
    logger.error('Error in bulk import', error);
    return res.status(500).json({
      success: false,
      message: 'Error in bulk import',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_,
  getCorreriaReferences,
  bulkImport
};
