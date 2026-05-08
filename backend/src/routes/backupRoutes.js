/**
 * Rutas para gestión de backups
 */

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Todas las rutas de backup requieren autenticación y rol de admin
router.use(verifyToken);
router.use(verifyAdmin);

// Obtener instancia actual
router.get('/instance/current', backupController.getCurrentInstance);

// Listar todos los backups
router.get('/', backupController.listBackups);

// Obtener reporte de validación
router.get('/validation/report', backupController.getValidationReport);

// Obtener estadísticas de almacenamiento
router.get('/stats', backupController.getBackupStats);

// Listar full dumps disponibles
// IMPORTANTE: debe ir ANTES de /:filename para que Express no lo capture como wildcard
router.get('/full-dumps/list', backupController.listFullDumps);

// Ejecutar backup manual
router.post('/manual', backupController.executeManualBackup);

// Restaurar desde un backup
router.post('/restore', backupController.restoreBackup);

// Generar full dump completo (solo soporte)
router.post('/full-dump', backupController.executeFullDump);

// Cargar dump desde archivo (solo soporte)
router.post('/upload-dump', backupController.uploadDump);

// Obtener información de un backup específico
// IMPORTANTE: debe ir AL FINAL porque /:filename captura cualquier segmento
router.get('/:filename', backupController.getBackupInfo);

module.exports = router;
