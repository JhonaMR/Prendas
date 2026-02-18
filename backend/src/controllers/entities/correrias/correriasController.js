/**
 * Controlador para operaciones CRUD de Correrias - POSTGRESQL
 */

const {
  validateCreateCorreria,
  validateUpdateCorreria,
  validateCorrieriaId
} = require('./correriasValidator');
const {
  getAllCorrerias,
  getCorrieriaById,
  createCorreria,
  updateCorreria,
  deleteCorreria
} = require('./correriasService');
const logger = require('../../shared/logger');

const list = async (req, res) => {
  try {
    const correrias = await getAllCorrerias();
    return res.json({ success: true, data: correrias });
  } catch (error) {
    logger.error('Error listing correrias', error);
    return res.status(500).json({ success: false, message: 'Error listing correrias' });
  }
};

const read = async (req, res) => {
  try {
    const { id } = req.params;
    validateCorrieriaId(id);
    const correria = await getCorrieriaById(id);
    return res.json({ success: true, data: correria });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error reading correria', error);
    return res.status(500).json({ success: false, message: 'Error reading correria' });
  }
};

const create = async (req, res) => {
  try {
    validateCreateCorreria(req.body);
    const correria = await createCorreria(req.body);
    return res.status(201).json({ success: true, data: correria, message: 'Correria created successfully' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    logger.error('Error creating correria', error);
    return res.status(500).json({ success: false, message: 'Error creating correria' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    validateCorrieriaId(id);
    validateUpdateCorreria(req.body);
    const correria = await updateCorreria(id, req.body);
    return res.json({ success: true, data: correria, message: 'Correria updated successfully' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error updating correria', error);
    return res.status(500).json({ success: false, message: 'Error updating correria' });
  }
};

const delete_ = async (req, res) => {
  try {
    const { id } = req.params;
    validateCorrieriaId(id);
    await deleteCorreria(id);
    return res.json({ success: true, message: 'Correria deleted successfully' });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error('Error deleting correria', error);
    return res.status(500).json({ success: false, message: 'Error deleting correria' });
  }
};

module.exports = { list, read, create, update, delete: delete_ };
