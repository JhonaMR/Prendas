/**
 * Controlador para Novedades de Correría
 */

const novedadesService = require('./novedadesService');
const logger = require('../../shared/logger');

/**
 * Obtener novedades
 */
async function getNovedades(req, res) {
  const { correriaId } = req.params;
  try {
    const novedades = await novedadesService.getNovedadesByCorreria(correriaId);
    res.json({
      success: true,
      data: novedades
    });
  } catch (error) {
    logger.error('Error en controller getNovedades:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener novedades'
    });
  }
}

/**
 * Guardar novedades (Batch)
 */
async function saveNovedades(req, res) {
  const { correriaId } = req.params;
  const { novedades } = req.body;

  if (!Array.isArray(novedades)) {
    return res.status(400).json({
      success: false,
      message: 'Las novedades deben ser un array de textos'
    });
  }

  try {
    const saved = await novedadesService.saveNovedadesBatch(correriaId, novedades);
    res.json({
      success: true,
      message: 'Novedades guardadas correctamente',
      data: saved
    });
  } catch (error) {
    logger.error('Error en controller saveNovedades:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al guardar novedades'
    });
  }
}

module.exports = {
  getNovedades,
  saveNovedades
};
