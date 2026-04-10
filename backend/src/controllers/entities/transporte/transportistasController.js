const { validateCreateTransportista, validateUpdateTransportista, validateTransportistaId } = require('./transportistasValidator');
const { getAllTransportistas, getTransportistaById, createTransportista, updateTransportista, deleteTransportista } = require('./transportistasService');
const logger = require('../../shared/logger');

const list = async (req, res) => {
  try {
    const data = await getAllTransportistas();
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error listing transportistas', error);
    return res.status(500).json({ success: false, message: 'Error listing transportistas' });
  }
};

const read = async (req, res) => {
  try {
    validateTransportistaId(req.params.id);
    const data = await getTransportistaById(req.params.id);
    return res.json({ success: true, data });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Error reading transportista' });
  }
};

const create = async (req, res) => {
  try {
    validateCreateTransportista(req.body);
    const data = await createTransportista(req.body);
    return res.status(201).json({ success: true, data, message: 'Transportista creado' });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    return res.status(500).json({ success: false, message: 'Error creating transportista' });
  }
};

const update = async (req, res) => {
  try {
    validateTransportistaId(req.params.id);
    validateUpdateTransportista(req.body);
    const data = await updateTransportista(req.params.id, req.body);
    return res.json({ success: true, data, message: 'Transportista actualizado' });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    return res.status(500).json({ success: false, message: 'Error updating transportista' });
  }
};

const remove = async (req, res) => {
  try {
    validateTransportistaId(req.params.id);
    await deleteTransportista(req.params.id);
    return res.json({ success: true, message: 'Transportista eliminado' });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Error deleting transportista' });
  }
};

module.exports = { list, read, create, update, remove };
