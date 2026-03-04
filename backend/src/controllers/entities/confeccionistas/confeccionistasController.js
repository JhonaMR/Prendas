/**
 * Controlador para operaciones CRUD de Confeccionistas - POSTGRESQL
 */

const {
  validateCreateConfeccionista,
  validateUpdateConfeccionista,
  validateConfeccionistaId
} = require('./confeccionistasValidator');
const {
  getAllConfeccionistas,
  getConfeccionistaById,
  createConfeccionista,
  updateConfeccionista,
  deleteConfeccionista
} = require('./confeccionistasService');
const { bulkImportConfeccionistas } = require('../../../services/BulkConfeccionistaImportService');
const { parseCSV } = require('../../../utils/csvParser');
const logger = require('../../../utils/logger');

/**
 * GET /api/confeccionistas
 */
const list = async (req, res) => {
  try {
    const confeccionistas = await getAllConfeccionistas();
    return res.json({
      success: true,
      data: confeccionistas
    });
  } catch (error) {
    logger.error('Error listing confeccionistas', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing confeccionistas'
    });
  }
};

/**
 * GET /api/confeccionistas/:id
 */
const read = async (req, res) => {
  try {
    const { id } = req.params;
    validateConfeccionistaId(id);

    const confeccionista = await getConfeccionistaById(id);
    return res.json({
      success: true,
      data: confeccionista
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error reading confeccionista', error);
    return res.status(500).json({
      success: false,
      message: 'Error reading confeccionista'
    });
  }
};

/**
 * POST /api/confeccionistas
 */
const create = async (req, res) => {
  try {
    validateCreateConfeccionista(req.body);

    const confeccionista = await createConfeccionista(req.body);
    return res.status(201).json({
      success: true,
      data: confeccionista,
      message: 'Confeccionista created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    logger.error('Error creating confeccionista', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating confeccionista'
    });
  }
};

/**
 * PUT /api/confeccionistas/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    validateConfeccionistaId(id);
    validateUpdateConfeccionista(req.body);

    const confeccionista = await updateConfeccionista(id, req.body);
    return res.json({
      success: true,
      data: confeccionista,
      message: 'Confeccionista updated successfully'
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
    logger.error('Error updating confeccionista', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating confeccionista'
    });
  }
};

/**
 * DELETE /api/confeccionistas/:id
 */
const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    validateConfeccionistaId(id);

    await deleteConfeccionista(id);
    return res.json({
      success: true,
      message: 'Confeccionista deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error deleting confeccionista', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting confeccionista'
    });
  }
};

/**
 * POST /api/confeccionistas/bulk-import
 * Importa confeccionistas masivamente desde un array de registros
 */
const bulkImport = async (req, res) => {
  try {
    const { records, csvContent } = req.body;

    let recordsToImport = records;

    // Si se proporciona contenido CSV, parsearlo
    if (csvContent && !records) {
      const parseResult = parseCSV(csvContent, ['id', 'name', 'phone', 'address', 'city', 'score']);
      
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: parseResult.error
        });
      }

      recordsToImport = parseResult.data;
    }

    if (!recordsToImport || !Array.isArray(recordsToImport)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de registros en el campo "records" o contenido CSV en "csvContent"'
      });
    }

    if (recordsToImport.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El array de registros no puede estar vacío'
      });
    }

    const result = await bulkImportConfeccionistas(recordsToImport);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in bulk import', error);
    return res.status(500).json({
      success: false,
      message: 'Error durante la importación masiva',
      error: error.message
    });
  }
};

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_,
  bulkImport
};
