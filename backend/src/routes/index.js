/**
 * 🛣️ RUTAS DEL API
 * 
 * Define todas las rutas (endpoints) del backend
 * Conecta URLs con controladores
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('../controllers/authController');
const crudController = require('../controllers/crudController');
const movementsController = require('../controllers/movementsController');

// Importar middleware
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ==================== RUTAS PÚBLICAS (No requieren autenticación) ====================

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post('/auth/login', authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Public
 */
router.post('/auth/register', authController.register);

// ==================== RUTAS PROTEGIDAS (Requieren autenticación) ====================

// Las siguientes rutas requieren token JWT válido

/**
 * @route   POST /api/auth/change-pin
 * @desc    Cambiar PIN del usuario
 * @access  Private
 */
router.post('/auth/change-pin', verifyToken, authController.changePin);

/**
 * @route   GET /api/auth/users
 * @desc    Listar todos los usuarios (solo admin)
 * @access  Private (Admin)
 */
router.get('/auth/users', verifyToken, verifyAdmin, authController.listUsers);

// ==================== REFERENCIAS ====================

router.get('/references', verifyToken, crudController.getReferences);
router.post('/references', verifyToken, crudController.createReference);
router.put('/references/:id', verifyToken, crudController.updateReference);
router.delete('/references/:id', verifyToken, crudController.deleteReference);

// ==================== CLIENTES ====================

router.get('/clients', verifyToken, crudController.getClients);
router.post('/clients', verifyToken, crudController.createClient);
router.put('/clients/:id', verifyToken, crudController.updateClient);
router.delete('/clients/:id', verifyToken, crudController.deleteClient);

// ==================== CONFECCIONISTAS ====================

router.get('/confeccionistas', verifyToken, crudController.getConfeccionistas);
router.post('/confeccionistas', verifyToken, crudController.createConfeccionista);
router.put('/confeccionistas/:id', verifyToken, crudController.updateConfeccionista);
router.delete('/confeccionistas/:id', verifyToken, crudController.deleteConfeccionista);

// ==================== VENDEDORES ====================

router.get('/sellers', verifyToken, crudController.getSellers);
router.post('/sellers', verifyToken, verifyAdmin, crudController.createSeller);
router.put('/sellers/:id', verifyToken, verifyAdmin, crudController.updateSeller);
router.delete('/sellers/:id', verifyToken, verifyAdmin, crudController.deleteSeller);

// ==================== CORRERIAS ====================

router.get('/correrias', verifyToken, crudController.getCorrerias);
router.post('/correrias', verifyToken, crudController.createCorreria);

// ==================== RECEPCIONES ====================

router.get('/receptions', verifyToken, movementsController.getReceptions);
router.post('/receptions', verifyToken, movementsController.createReception);

// ==================== DESPACHOS ====================

router.get('/dispatches', verifyToken, movementsController.getDispatches);
router.post('/dispatches', verifyToken, movementsController.createDispatch);

// ==================== PEDIDOS ====================

router.get('/orders', verifyToken, movementsController.getOrders);
router.post('/orders', verifyToken, movementsController.createOrder);

// ==================== TRACKING DE PRODUCCIÓN ====================

router.get('/production', verifyToken, movementsController.getProductionTracking);
router.post('/production', verifyToken, movementsController.updateProductionTracking);

// ==================== RUTA DE PRUEBA ====================

/**
 * @route   GET /api/health
 * @desc    Verificar que el servidor está funcionando
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
