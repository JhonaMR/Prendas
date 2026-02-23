// ============================================
// RUTAS: Sistema de Fichas
// Integración de todos los endpoints
// ============================================

const express = require('express');
const router = express.Router();

// Middleware de autenticación (ya existente en tu proyecto)
const { verifyToken } = require('../middleware/auth');

// Controllers
const disenadorasController = require('../controllers/disenadorasController');
const fichasDisenoController = require('../controllers/fichasDisenoController');
const fichasCostoController1 = require('../controllers/fichasCostoController_parte1');
const fichasCostoController2 = require('../controllers/fichasCostoController_parte2');
const maletasController = require('../controllers/maletasController');

// ============================================
// DISEÑADORAS
// ============================================
router.get('/disenadoras', verifyToken, disenadorasController.getDisenadoras);
router.post('/disenadoras', verifyToken, disenadorasController.createDisenadora);
router.put('/disenadoras/:id', verifyToken, disenadorasController.updateDisenadora);
router.delete('/disenadoras/:id', verifyToken, disenadorasController.deleteDisenadora);

// ============================================
// FICHAS DE DISEÑO
// ============================================
router.get('/fichas-diseno', verifyToken, fichasDisenoController.getFichasDiseno);
router.get('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.getFichaDiseno);
router.post('/fichas-diseno', verifyToken, fichasDisenoController.createFichaDiseno);
router.put('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.updateFichaDiseno);
router.delete('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.deleteFichaDiseno);

// Subida de fotos
router.post('/fichas-diseno/upload-foto', verifyToken, fichasDisenoController.uploadFoto);

// ============================================
// FICHAS DE COSTO
// ============================================
router.get('/fichas-costo', verifyToken, fichasCostoController1.getFichasCosto);
router.get('/fichas-costo/:referencia', verifyToken, fichasCostoController1.getFichaCosto);

// Importar desde diseño
router.post('/fichas-costo/importar', verifyToken, fichasCostoController2.importarFichaDiseno);

// CRUD fichas costo
router.post('/fichas-costo', verifyToken, fichasCostoController2.createFichaCosto);
router.put('/fichas-costo/:referencia', verifyToken, fichasCostoController2.updateFichaCosto);

// Cortes
router.post('/fichas-costo/:referencia/cortes', verifyToken, fichasCostoController2.crearCorte);
router.put('/fichas-costo/:referencia/cortes/:numeroCorte', verifyToken, fichasCostoController2.updateCorte);

// ============================================
// MALETAS
// ============================================
router.get('/maletas', verifyToken, maletasController.getMaletas);
router.get('/maletas/:id', verifyToken, maletasController.getMaleta);
router.post('/maletas', verifyToken, maletasController.createMaleta);
router.put('/maletas/:id', verifyToken, maletasController.updateMaleta);
router.delete('/maletas/:id', verifyToken, maletasController.deleteMaleta);

// Referencias sin correría
router.get('/maletas/referencias-sin-correria', verifyToken, maletasController.getReferenciasSinCorreria);

module.exports = router;
