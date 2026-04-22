const express = require('express');
const router = express.Router();
const corteController = require('../controllers/entities/corte/corteController');
const corteValidator = require('../controllers/entities/corte/corteValidator');
const { verifyToken } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// GET - Obtener todos los registros con paginación
router.get('/', corteController.getCorteRegistros);

// GET - Obtener un registro por ID
router.get('/:id', corteController.getCorteRegistroById);

// POST - Crear un nuevo registro
router.post(
  '/',
  corteValidator.validateCreateCorte,
  corteController.createCorteRegistro
);

// PUT - Actualizar un registro
router.put(
  '/:id',
  corteValidator.validateUpdateCorte,
  corteController.updateCorteRegistro
);

// DELETE - Eliminar un registro
router.delete(
  '/:id',
  corteController.deleteCorteRegistro
);

// POST - Importar registros desde Excel
router.post(
  '/import/excel',
  corteController.importCorteRegistros
);

// POST - Guardar múltiples registros (batch)
router.post(
  '/batch/save',
  corteController.saveCorteRegistrosBatch
);

module.exports = router;
