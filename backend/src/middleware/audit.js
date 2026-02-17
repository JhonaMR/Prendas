/**
 * 📋 AUDIT MIDDLEWARE
 * 
 * Middleware para capturar automáticamente cambios en CREATE, UPDATE, DELETE
 * Validación: Requirements 6.4
 */

const AuditService = require('../services/AuditService');

/**
 * Middleware para registrar cambios en auditoría
 * Debe usarse después de operaciones CREATE, UPDATE, DELETE
 * 
 * Uso:
 * router.post('/clients', auditMiddleware('clients', 'CREATE'), clientsController.create);
 * router.put('/clients/:id', auditMiddleware('clients', 'UPDATE'), clientsController.update);
 * router.delete('/clients/:id', auditMiddleware('clients', 'DELETE'), clientsController.delete);
 */
function auditMiddleware(entityType, action) {
  return (req, res, next) => {
    // Guardar el método original de res.json
    const originalJson = res.json;

    // Reemplazar res.json para interceptar la respuesta
    res.json = function(data) {
      // Si la operación fue exitosa, registrar en auditoría
      if (data && data.success) {
        try {
          const userId = req.user?.id || 'unknown';
          const ipAddress = req.ip || req.connection.remoteAddress;
          const userAgent = req.get('user-agent');

          // Obtener valores según la acción
          let oldValues = null;
          let newValues = null;
          let entityId = null;

          if (action === 'CREATE') {
            newValues = req.body;
            entityId = data.id || req.body.id;
          } else if (action === 'UPDATE') {
            oldValues = req.oldData; // Debe ser establecido por el controlador
            newValues = req.body;
            entityId = req.params.id;
          } else if (action === 'DELETE') {
            oldValues = req.oldData; // Debe ser establecido por el controlador
            entityId = req.params.id;
          }

          // Registrar en auditoría
          if (entityId) {
            AuditService.logChange({
              entityType,
              entityId,
              userId,
              action,
              oldValues,
              newValues,
              ipAddress,
              userAgent
            });
          }
        } catch (error) {
          console.error('Error en auditMiddleware:', error);
          // No interrumpir la respuesta si hay error en auditoría
        }
      }

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Middleware para capturar datos anteriores antes de UPDATE/DELETE
 * Debe usarse ANTES de auditMiddleware
 * 
 * Uso:
 * router.put('/clients/:id', captureOldDataMiddleware('clients'), auditMiddleware('clients', 'UPDATE'), clientsController.update);
 */
function captureOldDataMiddleware(entityType) {
  return (req, res, next) => {
    try {
      const { getDatabase } = require('../config/database');
      const db = getDatabase();

      const entityId = req.params.id;
      
      // Mapear entityType a nombre de tabla
      const tableMap = {
        'clients': 'clients',
        'sellers': 'sellers',
        'confeccionistas': 'confeccionistas',
        'references': 'product_references',
        'orders': 'orders',
        'correrias': 'correrias'
      };

      const tableName = tableMap[entityType];
      if (!tableName) {
        return next();
      }

      // Obtener datos anteriores
      const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
      const oldData = stmt.get(entityId);

      // Guardar en req para que el middleware de auditoría lo use
      req.oldData = oldData;

      next();
    } catch (error) {
      console.error('Error en captureOldDataMiddleware:', error);
      // No interrumpir si hay error
      next();
    }
  };
}

module.exports = {
  auditMiddleware,
  captureOldDataMiddleware
};
