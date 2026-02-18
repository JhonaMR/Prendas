/**
 * Controlador para operaciones CRUD de Sellers - POSTGRESQL
 */

const {
  validateCreateSeller,
  validateUpdateSeller,
  validateSellerId
} = require('./sellersValidator');
const {
  getAllSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller
} = require('./sellersService');
const logger = require('../../shared/logger');

const list = async (req, res) => {
  try {
    const sellers = await getAllSellers();
    logger.info('Listing sellers', { count: sellers.length });
    return res.json({ success: true, data: sellers });
  } catch (error) {
    logger.error('Error listing sellers', error);
    return res.status(500).json({ success: false, message: 'Error listing sellers' });
  }
};

const read = async (req, res) => {
  try {
    const { id } = req.params;
    validateSellerId(id);
    const seller = await getSellerById(id);
    return res.json({ success: true, data: seller });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error reading seller', error);
    return res.status(500).json({ success: false, message: 'Error reading seller' });
  }
};

const create = async (req, res) => {
  try {
    validateCreateSeller(req.body);
    const seller = await createSeller(req.body);
    return res.status(201).json({ success: true, data: seller, message: 'Seller created successfully' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    logger.error('Error creating seller', error);
    return res.status(500).json({ success: false, message: 'Error creating seller' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    validateSellerId(id);
    validateUpdateSeller(req.body);
    const seller = await updateSeller(id, req.body);
    return res.json({ success: true, data: seller, message: 'Seller updated successfully' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error updating seller', error);
    return res.status(500).json({ success: false, message: 'Error updating seller' });
  }
};

const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    validateSellerId(id);
    await deleteSeller(id);
    return res.json({ success: true, message: 'Seller deleted successfully' });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error deleting seller', error);
    return res.status(500).json({ success: false, message: 'Error deleting seller' });
  }
};

module.exports = { list, read, create, update, delete: delete_ };
