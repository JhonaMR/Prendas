/**
 * 📋 CONTROLADOR: Fichas (Diseño, Costo, Cortes, Maletas)
 * 
 * Maneja todas las operaciones CRUD para fichas
 */

const fichasService = require('./fichasService');
const { validateFichaDiseno, validateFichaCosto } = require('./fichasValidator');

// ==================== DISEÑADORAS ====================

exports.getDisenadoras = async (req, res) => {
  try {
    console.log('📋 GET /api/disenadoras');
    const disenadoras = await fichasService.getDisenadoras();
    console.log('✅ Diseñadoras obtenidas:', disenadoras.length);
    res.json({
      success: true,
      data: disenadoras
    });
  } catch (error) {
    console.error('❌ Error obteniendo diseñadoras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener diseñadoras'
    });
  }
};

// ==================== FICHAS DE DISEÑO ====================

exports.getFichasDiseno = async (req, res) => {
  try {
    console.log('📋 GET /api/fichas-diseno - Usuario:', req.user?.loginCode);
    const fichas = await fichasService.getFichasDiseno();
    console.log('✅ Fichas obtenidas:', fichas.length);
    res.json({
      success: true,
      data: fichas
    });
  } catch (error) {
    console.error('❌ Error obteniendo fichas de diseño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fichas de diseño',
      error: error.message
    });
  }
};

exports.getFichaDiseno = async (req, res) => {
  try {
    const { referencia } = req.params;
    const ficha = await fichasService.getFichaDiseno(referencia);
    
    if (!ficha) {
      return res.status(404).json({
        success: false,
        message: 'Ficha no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: ficha
    });
  } catch (error) {
    console.error('Error obteniendo ficha de diseño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ficha de diseño'
    });
  }
};

exports.createFichaDiseno = async (req, res) => {
  try {
    const { error, value } = validateFichaDiseno(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const ficha = await fichasService.createFichaDiseno(value);
    res.status(201).json({
      success: true,
      data: ficha,
      message: 'Ficha de diseño creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando ficha de diseño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ficha de diseño'
    });
  }
};

exports.updateFichaDiseno = async (req, res) => {
  try {
    const { referencia } = req.params;
    const ficha = await fichasService.updateFichaDiseno(referencia, req.body);
    
    res.json({
      success: true,
      data: ficha,
      message: 'Ficha de diseño actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando ficha de diseño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ficha de diseño'
    });
  }
};

// ==================== FICHAS DE COSTO ====================

exports.getFichasCosto = async (req, res) => {
  try {
    const fichas = await fichasService.getFichasCosto();
    res.json({
      success: true,
      data: fichas
    });
  } catch (error) {
    console.error('Error obteniendo fichas de costo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fichas de costo'
    });
  }
};

exports.getFichaCosto = async (req, res) => {
  try {
    const { referencia } = req.params;
    const ficha = await fichasService.getFichaCosto(referencia);
    
    if (!ficha) {
      return res.status(404).json({
        success: false,
        message: 'Ficha no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: ficha
    });
  } catch (error) {
    console.error('Error obteniendo ficha de costo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ficha de costo'
    });
  }
};

exports.createFichaCosto = async (req, res) => {
  try {
    const ficha = await fichasService.createFichaCosto(req.body);
    res.status(201).json({
      success: true,
      data: ficha,
      message: 'Ficha de costo creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando ficha de costo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ficha de costo'
    });
  }
};

exports.updateFichaCosto = async (req, res) => {
  try {
    const { referencia } = req.params;
    const ficha = await fichasService.updateFichaCosto(referencia, req.body);
    
    res.json({
      success: true,
      data: ficha,
      message: 'Ficha de costo actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando ficha de costo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ficha de costo'
    });
  }
};

// ==================== MALETAS ====================

exports.getMaletas = async (req, res) => {
  try {
    const maletas = await fichasService.getMaletas();
    res.json({
      success: true,
      data: maletas
    });
  } catch (error) {
    console.error('Error obteniendo maletas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener maletas'
    });
  }
};

exports.getMaleta = async (req, res) => {
  try {
    const { id } = req.params;
    const maleta = await fichasService.getMaleta(id);
    
    if (!maleta) {
      return res.status(404).json({
        success: false,
        message: 'Maleta no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: maleta
    });
  } catch (error) {
    console.error('Error obteniendo maleta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener maleta'
    });
  }
};

exports.createMaleta = async (req, res) => {
  try {
    const maleta = await fichasService.createMaleta(req.body);
    res.status(201).json({
      success: true,
      data: maleta,
      message: 'Maleta creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando maleta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear maleta'
    });
  }
};

exports.updateMaleta = async (req, res) => {
  try {
    const { id } = req.params;
    const maleta = await fichasService.updateMaleta(id, req.body);
    
    res.json({
      success: true,
      data: maleta,
      message: 'Maleta actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando maleta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar maleta'
    });
  }
};

exports.deleteMaleta = async (req, res) => {
  try {
    const { id } = req.params;
    await fichasService.deleteMaleta(id);
    
    res.json({
      success: true,
      message: 'Maleta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando maleta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar maleta'
    });
  }
};
