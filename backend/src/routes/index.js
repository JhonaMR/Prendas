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
const referencesController = require('../controllers/entities/references/referencesController');
const clientsController = require('../controllers/entities/clients/clientsController');
const confeccionistasController = require('../controllers/entities/confeccionistas/confeccionistasController');
const sellersController = require('../controllers/entities/sellers/sellersController');
const correriasController = require('../controllers/entities/correrias/correriasController');
const movementsController = require('../controllers/movementsController');
const { getDeliveryDates, saveDeliveryDatesBatchHandler, deleteDeliveryDateHandler } = require('../controllers/entities/deliveryDates/deliveryDatesController');

// Importar middleware
const { verifyToken, verifyAdmin, verifyAdminOrObserver } = require('../middleware/auth');
const { preventNonAdminEdit } = require('../middleware/editRestriction');

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

/**
 * @route   PUT /api/auth/users/:id
 * @desc    Actualizar usuario (solo admin)
 * @access  Private (Admin)
 */
router.put('/auth/users/:id', verifyToken, verifyAdmin, authController.updateUser);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Eliminar usuario (solo admin)
 * @access  Private (Admin)
 */
router.delete('/auth/users/:id', verifyToken, verifyAdmin, authController.deleteUser);

// ==================== REFERENCIAS ====================

router.get('/references', verifyToken, referencesController.list);
router.post('/references', verifyToken, preventNonAdminEdit, referencesController.create);
router.post('/references/bulk-import', verifyToken, preventNonAdminEdit, referencesController.bulkImport);
router.put('/references/:id', verifyToken, preventNonAdminEdit, referencesController.update);
router.delete('/references/:id', verifyToken, preventNonAdminEdit, referencesController.delete);
router.get('/correrias/:id/references', referencesController.getCorreriaReferences);

// ==================== CLIENTES ====================

router.get('/clients', verifyToken, clientsController.list);
router.post('/clients', verifyToken, preventNonAdminEdit, clientsController.create);
router.post('/clients/bulk-import', verifyToken, preventNonAdminEdit, clientsController.bulkImport);
router.put('/clients/:id', verifyToken, preventNonAdminEdit, clientsController.update);
router.delete('/clients/:id', verifyToken, preventNonAdminEdit, clientsController.delete);

// ==================== CONFECCIONISTAS ====================

router.get('/confeccionistas', verifyToken, confeccionistasController.list);
router.post('/confeccionistas', verifyToken, preventNonAdminEdit, confeccionistasController.create);
router.put('/confeccionistas/:id', verifyToken, preventNonAdminEdit, confeccionistasController.update);
router.delete('/confeccionistas/:id', verifyToken, preventNonAdminEdit, confeccionistasController.delete);

// ==================== VENDEDORES ====================

router.get('/sellers', verifyToken, sellersController.list);
router.post('/sellers', verifyToken, verifyAdmin, sellersController.create);
router.put('/sellers/:id', verifyToken, verifyAdmin, sellersController.update);
router.delete('/sellers/:id', verifyToken, verifyAdmin, sellersController.delete);

// ==================== CORRERIAS ====================

router.get('/correrias', verifyToken, correriasController.list);
router.post('/correrias', verifyToken, preventNonAdminEdit, correriasController.create);
router.put('/correrias/:id', verifyToken, preventNonAdminEdit, correriasController.update);
router.delete('/correrias/:id', verifyToken, preventNonAdminEdit, correriasController.delete);

// ==================== RECEPCIONES ====================

router.get('/receptions', verifyToken, movementsController.getReceptions);
router.post('/receptions', verifyToken, preventNonAdminEdit, movementsController.createReception);

// ==================== DEVOLUCIONES ====================

router.get('/return-receptions', verifyToken, movementsController.getReturnReceptions);
router.post('/return-receptions', verifyToken, preventNonAdminEdit, movementsController.createReturnReception);

// ==================== DESPACHOS ====================

router.get('/dispatches', verifyToken, movementsController.getDispatches);
router.post('/dispatches', verifyToken, preventNonAdminEdit, movementsController.createDispatch);
router.put('/dispatches/:id', verifyToken, preventNonAdminEdit, movementsController.updateDispatch);
router.delete('/dispatches/:id', verifyToken, preventNonAdminEdit, movementsController.deleteDispatch);

// ==================== PEDIDOS ====================

router.get('/orders', verifyToken, movementsController.getOrders);
router.post('/orders', verifyToken, preventNonAdminEdit, movementsController.createOrder);

// ==================== TRACKING DE PRODUCCIÓN ====================

router.get('/production', verifyToken, movementsController.getProductionTracking);
router.post('/production', verifyToken, preventNonAdminEdit, movementsController.updateProductionTracking);
router.post('/production/batch', verifyToken, preventNonAdminEdit, movementsController.saveProductionBatch); // ← AGREGAMOS ESTA LÍNEA

// ==================== FECHAS DE ENTREGA ====================

router.get('/delivery-dates', verifyToken, getDeliveryDates);
router.post('/delivery-dates/batch', verifyToken, preventNonAdminEdit, saveDeliveryDatesBatchHandler);
router.delete('/delivery-dates/:id', verifyToken, preventNonAdminEdit, deleteDeliveryDateHandler);

// ==================== BACKUPS ====================

const backupRoutes = require('./backupRoutes');
router.use('/backups', backupRoutes);

// ==================== HEALTH CHECK ====================

const healthRoutes = require('./health');
router.use('/', healthRoutes);

// ==================== CONFIGURATION RELOAD ====================

const configReloadRoutes = require('./configReload');
router.use('/config', configReloadRoutes);

module.exports = router;
