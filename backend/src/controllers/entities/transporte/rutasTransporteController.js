const { getAllRutas, createRuta, syncRutasPorFecha, deleteRuta } = require('./rutasTransporteService');
const logger = require('../../shared/logger');

const list = async (req, res) => {
  try {
    const { fecha } = req.query;
    const data = await getAllRutas(fecha || null);
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error listing rutas', error);
    return res.status(500).json({ success: false, message: 'Error listing rutas' });
  }
};

const create = async (req, res) => {
  try {
    if (!req.body.id || !req.body.fecha || !req.body.transportistaId) {
      return res.status(400).json({ success: false, message: 'id, fecha y transportistaId son requeridos' });
    }
    const data = await createRuta(req.body);
    return res.status(201).json({ success: true, data, message: 'Ruta creada' });
  } catch (error) {
    logger.error('Error creating ruta', error);
    return res.status(500).json({ success: false, message: 'Error creating ruta' });
  }
};

/**
 * POST /api/rutas-transporte/sync
 * Body: { fecha: 'YYYY-MM-DD', rutas: RutaTransporte[] }
 * Sincroniza el estado completo de un día desde el frontend
 */
const sync = async (req, res) => {
  try {
    const { fecha, rutas } = req.body;
    if (!fecha || !Array.isArray(rutas)) {
      return res.status(400).json({ success: false, message: 'fecha y rutas[] son requeridos' });
    }
    const data = await syncRutasPorFecha(fecha, rutas);
    return res.json({ success: true, data, message: 'Rutas sincronizadas' });
  } catch (error) {
    logger.error('Error syncing rutas', error);
    return res.status(500).json({ success: false, message: 'Error syncing rutas' });
  }
};

const remove = async (req, res) => {
  try {
    await deleteRuta(req.params.id);
    return res.json({ success: true, message: 'Ruta eliminada' });
  } catch (error) {
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Error deleting ruta' });
  }
};

module.exports = { list, create, sync, remove };
