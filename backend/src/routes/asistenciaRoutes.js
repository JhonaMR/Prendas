const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verifyToken } = require('../middleware/auth');
const { allowOperadorOrAdmin } = require('../middleware/generalUserRestriction');

// Empleados
router.get('/empleados', verifyToken, asistenciaController.getEmpleados);
router.post('/empleados', verifyToken, allowOperadorOrAdmin, asistenciaController.createOrUpdateEmpleado);
router.delete('/empleados/:id', verifyToken, allowOperadorOrAdmin, asistenciaController.deleteEmpleado);

// Importación
router.post('/check-import', verifyToken, asistenciaController.checkImport);
router.post('/import', verifyToken, allowOperadorOrAdmin, asistenciaController.importAsistencia);

// Registros diarios
router.get('/registros/:empleadoId', verifyToken, asistenciaController.getRegistrosEmpleado);
router.put('/registros/:id', verifyToken, allowOperadorOrAdmin, asistenciaController.updateRegistroDia);

module.exports = router;
