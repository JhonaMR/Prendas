/**
 * RUTAS DEL API
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
const novedadesController = require('../controllers/entities/correrias/novedadesController');
const movementsController = require('../controllers/movementsController');
const { getDeliveryDates, saveDeliveryDatesBatchHandler, deleteDeliveryDateHandler } = require('../controllers/entities/deliveryDates/deliveryDatesController');

// Importar middleware
const { verifyToken, verifyAdmin, verifyAdminOrObserver } = require('../middleware/auth');
const { preventNonAdminEdit } = require('../middleware/editRestriction');
const { allowDispatchCreate, allowDispatchEditDelete } = require('../middleware/dispatchRestriction');
const { allowReturnCreate, allowReturnEditDelete } = require('../middleware/returnRestriction');
const { allowReceptionCreate, allowComprasCreate, allowOrdersCreate, allowDeliveryDatesCreate, allowAdminOnly, allowOperadorOrAdmin } = require('../middleware/generalUserRestriction');

// ==================== RUTAS PÚBLICAS (No requieren autenticación) ====================

/**
 * @route   GET /api/health
 * @desc    Health check del servidor
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor activo',
    timestamp: new Date().toISOString()
  });
});

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

// ==================== PREFERENCIAS DE USUARIO ====================

const userPreferencesController = require('../controllers/userPreferencesController');

/**
 * @route   GET /api/user/preferences
 * @desc    Obtener preferencias del usuario autenticado
 * @access  Private
 */
router.get('/user/preferences', verifyToken, userPreferencesController.getUserPreferences);

/**
 * @route   POST /api/user/preferences
 * @desc    Guardar preferencias del usuario autenticado
 * @access  Private
 */
router.post('/user/preferences', verifyToken, userPreferencesController.saveUserPreferences);

// ==================== REFERENCIAS ====================

router.get('/references', verifyToken, referencesController.list);
router.post('/references', verifyToken, preventNonAdminEdit, referencesController.create);
router.post('/references/bulk-import', verifyToken, preventNonAdminEdit, referencesController.bulkImport);
router.put('/references/:id', verifyToken, preventNonAdminEdit, referencesController.update);
router.delete('/references/:id', verifyToken, preventNonAdminEdit, referencesController.delete);
router.post('/references/batch-remove-correria', verifyToken, preventNonAdminEdit, referencesController.batchRemoveCorreria);
router.get('/correrias/:id/references', referencesController.getCorreriaReferences);

// ==================== CLIENTES ====================

router.get('/clients', verifyToken, clientsController.list);
router.post('/clients', verifyToken, preventNonAdminEdit, clientsController.create);
router.post('/clients/bulk-import', verifyToken, preventNonAdminEdit, clientsController.bulkImport);
router.put('/clients/:id', verifyToken, preventNonAdminEdit, clientsController.update);
router.delete('/clients/:id', verifyToken, preventNonAdminEdit, clientsController.delete);

// ==================== CONFECCIONISTAS ====================

router.get('/confeccionistas', verifyToken, confeccionistasController.list);
router.post('/confeccionistas/bulk-import', verifyToken, preventNonAdminEdit, confeccionistasController.bulkImport);
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

// ==================== NOVEDADES DE CORRERIA ====================

router.get('/correrias/:correriaId/novedades', verifyToken, novedadesController.getNovedades);
router.post('/correrias/:correriaId/novedades', verifyToken, preventNonAdminEdit, novedadesController.saveNovedades);

// ==================== COMPRAS ====================

const comprasController = require('../controllers/entities/compras/comprasController');

router.get('/compras', verifyToken, comprasController.list);
router.post('/compras/batch', verifyToken, allowComprasCreate, comprasController.createBatch);
router.post('/compras', verifyToken, allowComprasCreate, comprasController.create);
router.get('/compras/:id', verifyToken, comprasController.read);
router.put('/compras/:id', verifyToken, allowOperadorOrAdmin, comprasController.update);
router.delete('/compras/:id', verifyToken, allowOperadorOrAdmin, comprasController.delete);

// ==================== INVENTORY MOVEMENTS ====================

const inventoryMovementsController = require('../controllers/entities/inventoryMovements/inventoryMovementsController');

router.get('/inventory-movements', verifyToken, inventoryMovementsController.getAll);
router.post('/inventory-movements', verifyToken, preventNonAdminEdit, inventoryMovementsController.create);
router.get('/inventory-movements/:id', verifyToken, inventoryMovementsController.getById);
router.put('/inventory-movements/:id', verifyToken, preventNonAdminEdit, inventoryMovementsController.update);
router.delete('/inventory-movements/:id', verifyToken, preventNonAdminEdit, inventoryMovementsController.delete);

// ==================== RECEPCIONES ====================

router.get('/receptions', verifyToken, movementsController.getReceptions);
router.post('/receptions', verifyToken, allowReceptionCreate, movementsController.createReception);
router.put('/receptions/:id', verifyToken, allowAdminOnly, movementsController.updateReception);
router.delete('/receptions/:id', verifyToken, allowAdminOnly, movementsController.deleteReception);

// ==================== DEVOLUCIONES ====================

router.get('/return-receptions', verifyToken, movementsController.getReturnReceptions);
router.post('/return-receptions', verifyToken, allowReturnCreate, movementsController.createReturnReception);
router.put('/return-receptions/:id', verifyToken, movementsController.updateReturnReception);
router.delete('/return-receptions/:id', verifyToken, movementsController.deleteReturnReception);

// ==================== DESPACHOS ====================

router.get('/dispatches', verifyToken, movementsController.getDispatches);
router.post('/dispatches', verifyToken, allowDispatchCreate, movementsController.createDispatch);
router.put('/dispatches/:id', verifyToken, allowDispatchEditDelete, movementsController.updateDispatch);
router.delete('/dispatches/:id', verifyToken, allowDispatchEditDelete, movementsController.deleteDispatch);

// ==================== PEDIDOS ====================

router.get('/orders', verifyToken, movementsController.getOrders);
router.post('/orders', verifyToken, allowOrdersCreate, movementsController.createOrder);
router.put('/orders/:id', verifyToken, allowAdminOnly, movementsController.updateOrder);
router.delete('/orders/:id', verifyToken, allowAdminOnly, movementsController.deleteOrder);

// ==================== TRACKING DE PRODUCCIÓN ====================

router.get('/production', verifyToken, movementsController.getProductionTracking);
router.post('/production', verifyToken, preventNonAdminEdit, movementsController.updateProductionTracking);
router.post('/production/batch', verifyToken, preventNonAdminEdit, movementsController.saveProductionBatch); // ← AGREGAMOS ESTA LÍNEA

// ==================== FECHAS DE ENTREGA ====================

router.get('/delivery-dates', verifyToken, getDeliveryDates);
router.post('/delivery-dates/batch', verifyToken, allowDeliveryDatesCreate, saveDeliveryDatesBatchHandler);
router.delete('/delivery-dates/:id', verifyToken, allowDeliveryDatesCreate, deleteDeliveryDateHandler);

// ==================== IMPORTACIÓN MASIVA ====================

const bulkImportController = require('../controllers/bulkImportController');

router.post('/bulk-import/references', verifyToken, verifyAdmin, bulkImportController.importReferences);
router.post('/bulk-import/cost-sheets', verifyToken, verifyAdmin, bulkImportController.importCostSheets);
router.post('/bulk-import/orders', verifyToken, verifyAdmin, bulkImportController.importOrders);
router.post('/bulk-import/dispatches', verifyToken, verifyAdmin, bulkImportController.importDispatches);
router.post('/bulk-import/receptions', verifyToken, verifyAdmin, bulkImportController.importReceptions);

// ==================== BACKUPS ====================

const backupRoutes = require('./backupRoutes');
router.use('/backups', backupRoutes);

// ==================== SESIONES ====================

const sessionRoutes = require('./sessionRoutes');
router.use('/sessions', sessionRoutes);

// ==================== HEALTH CHECK ====================

const healthRoutes = require('./health');
router.use('/', healthRoutes);

// ==================== CONFIGURATION RELOAD ====================

const configReloadRoutes = require('./configReload');
router.use('/config', configReloadRoutes);

// ==================== SISTEMA DE FICHAS ====================

const disenadorasController = require('../controllers/disenadorasController');
const fichasDisenoController = require('../controllers/fichasDisenoController');
const fichasCostoController1 = require('../controllers/fichasCostoController_parte1');
const fichasCostoController2 = require('../controllers/fichasCostoController_parte2');
const maletasController = require('../controllers/maletasController');

// Diseñadoras
router.get('/disenadoras', verifyToken, disenadorasController.getDisenadoras);
router.get('/disenadoras/all', verifyToken, disenadorasController.getAllDisenadoras);
router.post('/disenadoras', verifyToken, disenadorasController.createDisenadora);
router.put('/disenadoras/:id', verifyToken, disenadorasController.updateDisenadora);
router.patch('/disenadoras/:id/toggle-activa', verifyToken, disenadorasController.toggleActivaDisenadora);
router.delete('/disenadoras/:id', verifyToken, disenadorasController.deleteDisenadora);

// Fichas de Diseño - IMPORTANTE: upload-foto ANTES de /:referencia
router.post('/fichas-diseno/upload-foto', verifyToken, fichasDisenoController.uploadFoto);
router.get('/fichas-diseno', verifyToken, fichasDisenoController.getFichasDiseno);
router.get('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.getFichaDiseno);
router.post('/fichas-diseno', verifyToken, fichasDisenoController.createFichaDiseno);
router.put('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.updateFichaDiseno);
router.delete('/fichas-diseno/:referencia', verifyToken, fichasDisenoController.deleteFichaDiseno);

// Fichas de Costo - IMPORTANTE: rutas fijas ANTES de /:referencia
router.post('/fichas-costo/importar', verifyToken, allowAdminOnly, fichasCostoController2.importarFichaDiseno);
router.get('/fichas-costo', verifyToken, fichasCostoController1.getFichasCosto);
router.get('/fichas-costo/:referencia', verifyToken, fichasCostoController1.getFichaCosto);
router.post('/fichas-costo', verifyToken, fichasCostoController2.createFichaCosto);
router.put('/fichas-costo/:referencia', verifyToken, fichasCostoController2.updateFichaCosto);
router.delete('/fichas-costo/:referencia', verifyToken, allowOperadorOrAdmin, fichasCostoController2.deleteFichaCosto);

// Cortes
router.post('/fichas-costo/:referencia/cortes', verifyToken, fichasCostoController2.crearCorte);
router.put('/fichas-costo/:referencia/cortes/:numeroCorte', verifyToken, fichasCostoController2.updateCorte);

// Maletas - IMPORTANTE: referencias-sin-correria ANTES de /:id
router.get('/maletas/referencias-sin-correria', verifyToken, maletasController.getReferenciasSinCorreria);
router.get('/maletas', verifyToken, maletasController.getMaletas);
router.get('/maletas/:id', verifyToken, maletasController.getMaleta);
router.post('/maletas', verifyToken, maletasController.createMaleta);
router.put('/maletas/:id', verifyToken, maletasController.updateMaleta);
router.delete('/maletas/:id', verifyToken, maletasController.deleteMaleta);

// ==================== PRODUCTO EN PROCESO ====================

const productoEnProcesoController = require('../controllers/productoEnProcesoController');

router.get('/producto-en-proceso', verifyToken, productoEnProcesoController.getAll);
router.post('/producto-en-proceso/batch', verifyToken, productoEnProcesoController.saveBatch);
router.post('/producto-en-proceso', verifyToken, productoEnProcesoController.create);
router.put('/producto-en-proceso/:id', verifyToken, productoEnProcesoController.update);
router.delete('/producto-en-proceso/:id', verifyToken, productoEnProcesoController.remove);

// ==================== PAGO LOTES CONFIG ====================

const pagoLotesConfigController = require('../controllers/pagoLotesConfigController');

router.get('/pago-lotes-config', verifyToken, pagoLotesConfigController.getConfig);
router.put('/pago-lotes-config', verifyToken, verifyAdmin, pagoLotesConfigController.updateConfig);

// ==================== PROGRAMACIÓN DE PAGOS ====================

const programacionPagosController = require('../controllers/programacionPagosController');

// Cuentas bancarias
router.get('/cuentas-bancarias', verifyToken, programacionPagosController.getCuentas);
router.post('/cuentas-bancarias/bulk-import', verifyToken, allowOperadorOrAdmin, programacionPagosController.bulkImportCuentas);
router.post('/cuentas-bancarias', verifyToken, allowOperadorOrAdmin, programacionPagosController.createCuenta);
router.put('/cuentas-bancarias/:id', verifyToken, allowOperadorOrAdmin, programacionPagosController.updateCuenta);
router.delete('/cuentas-bancarias/:id', verifyToken, allowOperadorOrAdmin, programacionPagosController.deleteCuenta);

// Pagos programados
router.get('/pagos-programados/conteo', verifyToken, programacionPagosController.getConteoPorMes);
router.get('/pagos-programados', verifyToken, programacionPagosController.getPagosPorFecha);
router.post('/pagos-programados', verifyToken, allowOperadorOrAdmin, programacionPagosController.createPago);
router.put('/pagos-programados/reordenar', verifyToken, allowOperadorOrAdmin, programacionPagosController.reordenarPagos);
router.put('/pagos-programados/:id', verifyToken, allowOperadorOrAdmin, programacionPagosController.updatePago);
router.delete('/pagos-programados/:id', verifyToken, allowOperadorOrAdmin, programacionPagosController.deletePago);

// ==================== TRANSPORTE ====================

const transportistasController = require('../controllers/entities/transporte/transportistasController');
const talleresController        = require('../controllers/entities/transporte/talleresController');
const rutasTransporteController = require('../controllers/entities/transporte/rutasTransporteController');

router.get('/transportistas',              verifyToken, transportistasController.list);
router.post('/transportistas',             verifyToken, allowOperadorOrAdmin, transportistasController.create);
router.put('/transportistas/:id',          verifyToken, allowOperadorOrAdmin, transportistasController.update);
router.delete('/transportistas/:id',       verifyToken, allowOperadorOrAdmin, transportistasController.remove);

router.get('/talleres',                    verifyToken, talleresController.list);
router.post('/talleres/bulk-import',       verifyToken, allowOperadorOrAdmin, talleresController.bulkImport);
router.post('/talleres',                   verifyToken, allowOperadorOrAdmin, talleresController.create);
router.put('/talleres/:id',                verifyToken, allowOperadorOrAdmin, talleresController.update);
router.delete('/talleres/:id',             verifyToken, allowOperadorOrAdmin, talleresController.remove);

router.get('/rutas-transporte',            verifyToken, rutasTransporteController.list);
router.get('/rutas-transporte/por-referencia', verifyToken, rutasTransporteController.buscarPorReferencia);
router.post('/rutas-transporte',           verifyToken, rutasTransporteController.create);
router.post('/rutas-transporte/sync',      verifyToken, rutasTransporteController.sync);
router.delete('/rutas-transporte/:id',     verifyToken, preventNonAdminEdit, rutasTransporteController.remove);

// ==================== CHAT ====================

const chatController = require('../controllers/chatController');

/**
 * @route   GET /api/chat/active-users
 * @desc    Obtener usuarios activos conectados
 * @access  Private
 */
router.get('/chat/active-users', verifyToken, chatController.getActiveUsers);

/**
 * @route   GET /api/chat/messages/:userId
 * @desc    Obtener historial de mensajes con un usuario
 * @access  Private
 */
router.get('/chat/messages/:userId', verifyToken, chatController.getMessages);

/**
 * @route   POST /api/chat/messages
 * @desc    Enviar un mensaje
 * @access  Private
 */
router.post('/chat/messages', verifyToken, chatController.sendMessage);

/**
 * @route   PUT /api/chat/messages/:userId/read
 * @desc    Marcar mensajes como leídos
 * @access  Private
 */
router.put('/chat/messages/:userId/read', verifyToken, chatController.markAsRead);

/**
 * @route   GET /api/chat/unread-messages
 * @desc    Obtener resumen de mensajes no leídos
 * @access  Private
 */
router.get('/chat/unread-messages', verifyToken, chatController.getUnreadMessages);

/**
 * @route   DELETE /api/chat/messages
 * @desc    Limpiar mensajes antiguos (solo admin)
 * @access  Private (Admin)
 */
router.delete('/chat/messages', verifyToken, verifyAdmin, chatController.deleteOldMessages);

module.exports = router;

