/**
 * 📋 AUDIT SERVICE
 * 
 * Servicio para registrar y consultar cambios en la base de datos
 * Validación: Requirements 6.5, 6.7
 */

const { getDatabase } = require('../config/database');

class AuditService {
  /**
   * Registrar un cambio en el audit_log
   * @param {Object} params - Parámetros del cambio
   * @param {string} params.entityType - Tipo de entidad (clients, sellers, etc)
   * @param {string} params.entityId - ID de la entidad
   * @param {string} params.userId - ID del usuario que hizo el cambio
   * @param {string} params.action - Acción (CREATE, UPDATE, DELETE)
   * @param {Object} params.oldValues - Valores anteriores (para UPDATE/DELETE)
   * @param {Object} params.newValues - Valores nuevos (para CREATE/UPDATE)
   * @param {string} params.ipAddress - Dirección IP del cliente
   * @param {string} params.userAgent - User Agent del cliente
   * @returns {Object} Resultado de la operación
   */
  static logChange(params) {
    try {
      const db = getDatabase();
      
      const {
        entityType,
        entityId,
        userId,
        action,
        oldValues = null,
        newValues = null,
        ipAddress = null,
        userAgent = null
      } = params;

      // Calcular cambios (diferencias entre oldValues y newValues)
      let changes = null;
      if (oldValues && newValues && action === 'UPDATE') {
        changes = this._calculateChanges(oldValues, newValues);
      }

      // Insertar en audit_log
      const stmt = db.prepare(`
        INSERT INTO audit_log (
          entity_type,
          entity_id,
          user_id,
          action,
          old_values,
          new_values,
          changes,
          ip_address,
          user_agent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      const result = stmt.run(
        entityType,
        entityId,
        userId,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent
      );

      return {
        success: true,
        id: result.lastInsertRowid,
        message: `Cambio registrado: ${action} en ${entityType}/${entityId}`
      };
    } catch (error) {
      console.error('Error en AuditService.logChange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener histórico de cambios de una entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @returns {Array} Lista de cambios
   */
  static getEntityHistory(entityType, entityId) {
    try {
      const db = getDatabase();

      const stmt = db.prepare(`
        SELECT 
          id,
          entity_type,
          entity_id,
          user_id,
          action,
          old_values,
          new_values,
          changes,
          ip_address,
          user_agent,
          created_at
        FROM audit_log
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY created_at DESC
      `);

      const history = stmt.all(entityType, entityId);

      // Parsear JSON fields
      return history.map(record => ({
        ...record,
        oldValues: record.old_values ? JSON.parse(record.old_values) : null,
        newValues: record.new_values ? JSON.parse(record.new_values) : null,
        changes: record.changes ? JSON.parse(record.changes) : null
      }));
    } catch (error) {
      console.error('Error en AuditService.getEntityHistory:', error);
      return [];
    }
  }

  /**
   * Obtener acciones de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado
   * @param {number} options.limit - Límite de registros
   * @param {number} options.offset - Offset para paginación
   * @returns {Array} Lista de acciones
   */
  static getUserActions(userId, options = {}) {
    try {
      const db = getDatabase();
      const { limit = 100, offset = 0 } = options;

      const stmt = db.prepare(`
        SELECT 
          id,
          entity_type,
          entity_id,
          user_id,
          action,
          old_values,
          new_values,
          changes,
          ip_address,
          user_agent,
          created_at
        FROM audit_log
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const actions = stmt.all(userId, limit, offset);

      // Parsear JSON fields
      return actions.map(record => ({
        ...record,
        oldValues: record.old_values ? JSON.parse(record.old_values) : null,
        newValues: record.new_values ? JSON.parse(record.new_values) : null,
        changes: record.changes ? JSON.parse(record.changes) : null
      }));
    } catch (error) {
      console.error('Error en AuditService.getUserActions:', error);
      return [];
    }
  }

  /**
   * Obtener acciones por tipo
   * @param {string} action - Tipo de acción (CREATE, UPDATE, DELETE)
   * @param {Object} options - Opciones de filtrado
   * @param {number} options.limit - Límite de registros
   * @param {number} options.offset - Offset para paginación
   * @returns {Array} Lista de acciones
   */
  static getActionsByType(action, options = {}) {
    try {
      const db = getDatabase();
      const { limit = 100, offset = 0 } = options;

      const stmt = db.prepare(`
        SELECT 
          id,
          entity_type,
          entity_id,
          user_id,
          action,
          old_values,
          new_values,
          changes,
          ip_address,
          user_agent,
          created_at
        FROM audit_log
        WHERE action = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const actions = stmt.all(action, limit, offset);

      // Parsear JSON fields
      return actions.map(record => ({
        ...record,
        oldValues: record.old_values ? JSON.parse(record.old_values) : null,
        newValues: record.new_values ? JSON.parse(record.new_values) : null,
        changes: record.changes ? JSON.parse(record.changes) : null
      }));
    } catch (error) {
      console.error('Error en AuditService.getActionsByType:', error);
      return [];
    }
  }

  /**
   * Calcular cambios entre dos objetos
   * @private
   * @param {Object} oldValues - Valores anteriores
   * @param {Object} newValues - Valores nuevos
   * @returns {Object} Cambios detectados
   */
  static _calculateChanges(oldValues, newValues) {
    const changes = {};

    // Comparar todas las claves
    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {})
    ]);

    for (const key of allKeys) {
      const oldValue = oldValues?.[key];
      const newValue = newValues?.[key];

      if (oldValue !== newValue) {
        changes[key] = {
          from: oldValue,
          to: newValue
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Obtener estadísticas de auditoría
   * @returns {Object} Estadísticas
   */
  static getStats() {
    try {
      const db = getDatabase();

      const totalCount = db.prepare('SELECT COUNT(*) as count FROM audit_log').get();
      
      const actionCounts = db.prepare(`
        SELECT action, COUNT(*) as count
        FROM audit_log
        GROUP BY action
      `).all();

      const entityCounts = db.prepare(`
        SELECT entity_type, COUNT(*) as count
        FROM audit_log
        GROUP BY entity_type
      `).all();

      return {
        totalRecords: totalCount.count,
        byAction: actionCounts.reduce((acc, row) => {
          acc[row.action] = row.count;
          return acc;
        }, {}),
        byEntity: entityCounts.reduce((acc, row) => {
          acc[row.entity_type] = row.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error en AuditService.getStats:', error);
      return null;
    }
  }
}

module.exports = AuditService;
