/**
 * Controlador para operaciones CRUD de Clients
 */

const {
  validateCreateClient,
  validateUpdateClient,
  validateClientId
} = require('./clientsValidator');
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('./clientsService');
const { bulkImportClients } = require('../../../services/BulkClientImportService');
const { parseCSV } = require('../../../utils/csvParser');
const logger = require('../../shared/logger');

/**
 * GET /api/clients
 */
const list = (req, res) => {
  try {
    const clients = getAllClients();
    return res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    logger.error('Error listing clients', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing clients'
    });
  }
};

/**
 * GET /api/clients/:id
 */
const read = (req, res) => {
  try {
    const { id } = req.params;
    validateClientId(id);

    const client = getClientById(id);
    return res.json({
      success: true,
      data: client
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error reading client', error);
    return res.status(500).json({
      success: false,
      message: 'Error reading client'
    });
  }
};

/**
 * POST /api/clients
 */
const create = (req, res) => {
  try {
    validateCreateClient(req.body);

    const client = createClient(req.body);
    return res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    logger.error('Error creating client', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating client'
    });
  }
};

/**
 * PUT /api/clients/:id
 */
const update = (req, res) => {
  try {
    const { id } = req.params;
    validateClientId(id);
    validateUpdateClient(req.body);

    const client = updateClient(id, req.body);
    return res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
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
    logger.error('Error updating client', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating client'
    });
  }
};

/**
 * DELETE /api/clients/:id
 */
const delete_ = (req, res) => {
  try {
    const { id } = req.params;
    validateClientId(id);

    deleteClient(id);
    return res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error deleting client', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting client'
    });
  }
};

/**
 * POST /api/clients/bulk-import
 * Importa clientes masivamente desde un array de registros
 */
const bulkImport = (req, res) => {
  try {
    const { records, csvContent } = req.body;

    let recordsToImport = records;

    // Si se proporciona contenido CSV, parsearlo
    if (csvContent && !records) {
      const parseResult = parseCSV(csvContent, ['id', 'name', 'nit', 'address', 'city', 'seller']);
      
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

    const result = bulkImportClients(recordsToImport);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors,
        imported: result.imported
      });
    }

    logger.info('Bulk import successful', { imported: result.imported });
    return res.status(201).json({
      success: true,
      message: result.message,
      imported: result.imported
    });
  } catch (error) {
    logger.error('Error in bulk import', error);
    return res.status(500).json({
      success: false,
      message: 'Error durante la importación masiva'
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
