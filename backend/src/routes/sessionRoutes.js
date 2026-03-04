/**
 * Rutas para gestión de sesiones
 */

const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { closeSessionsManually } = require('../jobs/sessionCloseJob');

/**
 * POST /api/sessions/close-all
 * Cierra todas las sesiones (solo admin, para testing)
 */
router.post('/close-all', verifyToken, verifyAdmin, (req, res) => {
  try {
    closeSessionsManually();
    
    res.json({
      success: true,
      message: 'Todas las sesiones han sido cerradas'
    });
  } catch (error) {
    console.error('Error cerrando sesiones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
