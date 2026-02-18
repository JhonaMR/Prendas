/**
 * 📋 AUDIT SERVICE - POSTGRESQL
 * 
 * Servicio para registrar y consultar cambios en la base de datos
 * Validación: Requirements 6.5, 6.7
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Registrar un cambio en el audit_log
   * @async
   * @param {Object} params - Parámetros del cambio
   * @param {string} params.entityType - Tipo de entidad (clients, sellers, etc)
   * @param {string} params.entityId - ID de la entidad
   * @param {string} params.userId - ID del usuario que hizo el cambio
   * @param {string} params.action - Acción (CREATE, UPDATE, DELETE)
   * @param {Object} params.oldValues - Valores anteriores (para UPDATE/DELETE)
   * @param {Object} params.newValues - Valores nuevos (para CREATE/UPDATE)
   * @param {string} params.ipAddress - Dirección IP del cliente
   * @param {string} params.userAgent - User Agent del cliente
   * @returns {Promise<Object>} Resultado de la operación
   */
  static async logChange(params) {
    try {
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
      const result = await query(
        `INSERT INTO audit_log (
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING id`,
        [
          entityType,
          entityId,
          userId,
          action,
          oldValues ? oldValues : null,
          newValues ? newValues : null,
          changes ? changes : null,
          ipAddress,
          userAgent
        ]
      );

      return {
        success: true,
        id: result.rows[0].id,
        message: `Cambio registrado: ${action} en ${entityType}/${entityId}`
      };
    } catch (error) {
      logger.error('Error en AuditService.logChange:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener histórico de cambios de una entidad
   * @async
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @returns {Promise<Array>} Lista de cambios
   */
  static async getEntityHistory(entityType, entityId) {
    try {
      const result = await query(
        `SELECT 
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
        WHERE entity_type = $1 AND entity_id = $2
        ORDER BY created_at DESC`,
        [entityType, entityId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error en AuditService.getEntityHistory:', error);
      return [];
    }
  }

  /**
   * Obtener acciones de un usuario
   * @async
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de filtrado
   * @param {number} options.limit - Límite de registros
   * @param {number} options.offset - Offset para paginación
   * @returns {Promise<Array>} Lista de acciones
   */
  static async getUserActions(userId, options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;

      const result = await query(
        `SELECT 
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
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error en AuditService.getUserActions:', error);
      return [];
    }
  }

  /**
   * Obtener acciones por tipo
   * @async
   * @param {string} action - Tipo de acción (CREATE, UPDATE, DELETE)
   * @param {Object} options - Opciones de filtrado
   * @param {number} options.limit - Límite de registros
   * @param {number} options.offset - Offset para paginación
   * @returns {Promise<Array>} Lista de acciones
   */
  static async getActionsByType(action, options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;

      const result = await query(
        `SELECT 
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
        WHERE action = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [action, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error en AuditService.getActionsByType:', error);
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
   * @async
   * @returns {Promise<Object>} Estadísticas
   */
  static async getStats() {
    try {
      const totalResult = await query('SELECT COUNT(*) as count FROM audit_log');
      const actionResult = await query(`
        SELECT action, COUNT(*) as count
        FROM audit_log
        GROUP BY action
      `);
      const entityResult = await query(`
        SELECT entity_type, COUNT(*) as count
        FROM audit_log
        GROUP BY entity_type
      `);

      return {
        totalRecords: parseInt(totalResult.rows[0].count),
        byAction: actionResult.rows.reduce((acc, row) => {
          acc[row.action] = parseInt(row.count);
          return acc;
        }, {}),
        byEntity: entityResult.rows.reduce((acc, row) => {
          acc[row.entity_type] = parseInt(row.count);
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Error en AuditService.getStats:', error);
      return null;
    }
  }
}

module.exports = AuditService;
