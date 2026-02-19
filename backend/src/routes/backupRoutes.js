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

// Listar todos los backups
router.get('/', backupController.listBackups);

// Obtener estadísticas de almacenamiento
router.get('/stats', backupController.getBackupStats);

// Obtener información de un backup específico
router.get('/:filename', backupController.getBackupInfo);

// Ejecutar backup manual
router.post('/manual', backupController.executeManualBackup);

// Restaurar desde un backup
router.post('/restore', backupController.restoreBackup);

module.exports = router;
