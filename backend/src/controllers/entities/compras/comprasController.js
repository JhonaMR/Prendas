/**
 * Controlador para operaciones CRUD de Compras - POSTGRESQL
 */

const {
  validateCreateCompra,
  validateUpdateCompra,
  validateCompraId
} = require('./comprasValidator');
const {
  getAllCompras,
  getCompraById,
  createCompra,
  updateCompra,
  deleteCompra
} = require('./comprasService');
const logger = require('../../shared/logger');

/**
 * GET /api/compras
 */
const list = async (req, res) => {
  try {
    const compras = await getAllCompras();
    return res.json({
      success: true,
      data: compras
    });
  } catch (error) {
    logger.error('Error listing compras', error);
    return res.status(500).json({
      success: false,
      message: 'Error listing compras'
    });
  }
};

/**
 * GET /api/compras/:id
 */
const read = async (req, res) => {
  try {
    const { id } = req.params;
    validateCompraId(id);

    const compra = await getCompraById(id);
    return res.json({
      success: true,
      data: compra
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error reading compra', error);
    return res.status(500).json({
      success: false,
      message: 'Error reading compra'
    });
  }
};

/**
 * POST /api/compras
 */
const create = async (req, res) => {
  try {
    validateCreateCompra(req.body);

    const compra = await createCompra(req.body);
    return res.status(201).json({
      success: true,
      data: compra,
      message: 'Compra created successfully'
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    logger.error('Error creating compra', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating compra'
    });
  }
};

/**
 * PUT /api/compras/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    validateCompraId(id);
    validateUpdateCompra(req.body);

    const compra = await updateCompra(id, req.body);
    return res.json({
      success: true,
      data: compra,
      message: 'Compra updated successfully'
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
    logger.error('Error updating compra', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating compra'
    });
  }
};

/**
 * DELETE /api/compras/:id
 */
const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    validateCompraId(id);

    await deleteCompra(id);
    return res.json({
      success: true,
      message: 'Compra deleted successfully'
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    logger.error('Error deleting compra', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting compra'
    });
  }
};

/**
 * POST /api/compras/batch
 */
const createBatch = async (req, res) => {
  try {
    const { compras } = req.body;

    if (!Array.isArray(compras) || compras.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de compras'
      });
    }

    const results = {
      created: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < compras.length; i++) {
      try {
        validateCreateCompra(compras[i]);
        await createCompra(compras[i]);
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          message: error.message || 'Error creating compra'
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: results,
      message: `${results.created} compras created, ${results.failed} failed`
    });
  } catch (error) {
    logger.error('Error creating batch compras', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating batch compras'
    });
  }
};

module.exports = {
  list,
  read,
  create,
  update,
  delete: delete_,
  createBatch
};
