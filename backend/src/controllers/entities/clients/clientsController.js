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

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_
};
