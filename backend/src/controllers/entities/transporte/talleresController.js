const { validateCreateTaller, validateUpdateTaller, validateTallerId } = require('./talleresValidator');
const { getAllTalleres, getTallerById, createTaller, updateTaller, deleteTaller } = require('./talleresService');
const logger = require('../../shared/logger');

const list = async (req, res) => {
  try {
    const data = await getAllTalleres();
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error listing talleres', error);
    return res.status(500).json({ success: false, message: 'Error listing talleres' });
  }
};

const create = async (req, res) => {
  try {
    validateCreateTaller(req.body);
    const data = await createTaller(req.body);
    return res.status(201).json({ success: true, data, message: 'Taller creado' });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    return res.status(500).json({ success: false, message: 'Error creating taller' });
  }
};

const update = async (req, res) => {
  try {
    validateTallerId(req.params.id);
    validateUpdateTaller(req.body);
    const data = await updateTaller(req.params.id, req.body);
    return res.json({ success: true, data, message: 'Taller actualizado' });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    return res.status(500).json({ success: false, message: 'Error updating taller' });
  }
};

const remove = async (req, res) => {
  try {
    validateTallerId(req.params.id);
    await deleteTaller(req.params.id);
    return res.json({ success: true, message: 'Taller eliminado' });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Error deleting taller' });
  }
};

const bulkImport = async (req, res) => {
  try {
    const { talleres } = req.body;
    if (!Array.isArray(talleres) || talleres.length === 0) {
      return res.status(400).json({ success: false, message: 'No se enviaron talleres' });
    }
    let ok = 0;
    let errores = 0;
    for (const t of talleres) {
      try {
        if (!t.nombre?.trim()) { errores++; continue; }
        const id = `taller_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await createTaller({
          id,
          nombre: t.nombre.trim(),
          celular: t.celular || '',
          direccion: t.direccion || '',
          sector: t.sector || '',
          estado: t.estado === 'inactivo' ? 'inactivo' : 'activo',
        });
        ok++;
      } catch (e) {
        errores++;
      }
    }
    return res.json({ success: true, data: { ok, errores }, message: `${ok} talleres importados` });
  } catch (error) {
    logger.error('Error bulk importing talleres', error);
    return res.status(500).json({ success: false, message: 'Error en importación masiva' });
  }
};

module.exports = { list, create, update, remove, bulkImport };
