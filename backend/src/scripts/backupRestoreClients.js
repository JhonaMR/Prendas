/**
 * Script de backup y restauración para la tabla clients
 * 
 * Este script proporciona funcionalidades para:
 * 1. Crear backup del estado actual de la tabla clients
 * 2. Restaurar desde un backup
 * 3. Crear puntos de restauración durante migraciones
 * 4. Implementar rollback automático en caso de error
 * 
 * Validates: Requirements 5.5
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { query } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../controllers/shared/logger');

class BackupRestoreManager {
  constructor(backupDir = null) {
    this.backupDir = backupDir || path.join(__dirname, '../../../backups');
    this.ensureBackupDir();
  }

  /**
   * Asegurar que el directorio de backups existe
   */
  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`Directorio de backups creado/verificado: ${this.backupDir}`);
    } catch (error) {
      logger.error('Error creando directorio de backups:', error);
      throw error;
    }
  }

  /**
   * Crear un backup de la tabla clients
   * @param {string} backupName - Nombre del backup (opcional)
   * @returns {object} Información del backup creado
   */
  async createBackup(backupName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = backupName || `clients-backup-${timestamp}`;
    const backupFile = path.join(this.backupDir, `${backupId}.json`);
    
    try {
      logger.info(`Creando backup: ${backupId}`);
      
      // Obtener todos los datos de la tabla clients
      const result = await query(`
        SELECT id, name, nit, address, city, seller_id, 
               created_at, updated_at
        FROM clients
        ORDER BY id
      `);
      
      const backupData = {
        metadata: {
          backupId,
          timestamp: new Date().toISOString(),
          table: 'clients',
          recordCount: result.rows.length,
          schemaVersion: '1.0'
        },
        data: result.rows
      };
      
      // Guardar backup en archivo
      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
      
      logger.info(`Backup creado exitosamente: ${backupFile}`);
      logger.info(`Registros respaldados: ${result.rows.length}`);
      
      return {
        success: true,
        backupId,
        backupFile,
        recordCount: result.rows.length,
        timestamp: backupData.metadata.timestamp
      };
      
    } catch (error) {
      logger.error('Error creando backup:', error);
      return {
        success: false,
        error: error.message,
        backupId
      };
    }
  }

  /**
   * Restaurar desde un backup
   * @param {string} backupId - ID del backup a restaurar
   * @returns {object} Resultado de la restauración
   */
  async restoreFromBackup(backupId) {
    const backupFile = path.join(this.backupDir, `${backupId}.json`);
    
    try {
      logger.info(`Restaurando desde backup: ${backupId}`);
      
      // Verificar que el archivo de backup existe
      try {
        await fs.access(backupFile);
      } catch {
        throw new Error(`Backup no encontrado: ${backupFile}`);
      }
      
      // Leer datos del backup
      const backupContent = await fs.readFile(backupFile, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      logger.info(`Backup encontrado: ${backupData.metadata.backupId}`);
      logger.info(`Registros a restaurar: ${backupData.data.length}`);
      
      // Iniciar transacción para restauración
      await query('BEGIN');
      
      try {
        // Limpiar tabla actual (opcional, dependiendo del caso de uso)
        logger.info('Limpiando tabla clients...');
        await query('DELETE FROM clients');
        
        // Restaurar datos
        logger.info('Restaurando datos...');
        let restoredCount = 0;
        
        for (const record of backupData.data) {
          await query(`
            INSERT INTO clients (id, name, nit, address, city, seller_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            record.id,
            record.name,
            record.nit,
            record.address,
            record.city,
            record.seller_id,
            record.created_at,
            record.updated_at
          ]);
          
          restoredCount++;
          
          // Log cada 100 registros
          if (restoredCount % 100 === 0) {
            logger.info(`Restaurados ${restoredCount} registros...`);
          }
        }
        
        // Confirmar transacción
        await query('COMMIT');
        
        logger.info(`✅ Restauración completada: ${restoredCount} registros restaurados`);
        
        return {
          success: true,
          backupId,
          restoredCount,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        // Rollback en caso de error
        await query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      logger.error('Error restaurando desde backup:', error);
      return {
        success: false,
        error: error.message,
        backupId
      };
    }
  }

  /**
   * Crear un punto de restauración (snapshot rápido)
   * @returns {object} Información del punto de restauración
   */
  async createRestorePoint() {
    return this.createBackup(`restore-point-${Date.now()}`);
  }

  /**
   * Listar todos los backups disponibles
   * @returns {array} Lista de backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const backupData = JSON.parse(content);
            
            backups.push({
              file,
              backupId: backupData.metadata.backupId,
              timestamp: backupData.metadata.timestamp,
              recordCount: backupData.metadata.recordCount,
              size: stats.size,
              created: stats.mtime
            });
          } catch (error) {
            logger.warn(`Error leyendo backup ${file}:`, error.message);
          }
        }
      }
      
      // Ordenar por fecha (más reciente primero)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return backups;
      
    } catch (error) {
      logger.error('Error listando backups:', error);
      return [];
    }
  }

  /**
   * Verificar integridad de un backup
   * @param {string} backupId - ID del backup a verificar
   * @returns {object} Resultado de verificación
   */
  async verifyBackup(backupId) {
    const backupFile = path.join(this.backupDir, `${backupId}.json`);
    
    try {
      // Verificar que el archivo existe
      await fs.access(backupFile);
      
      // Leer y parsear el backup
      const content = await fs.readFile(backupFile, 'utf8');
      const backupData = JSON.parse(content);
      
      // Verificar estructura básica
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Estructura de backup inválida');
      }
      
      // Verificar que todos los registros tienen campos requeridos
      const requiredFields = ['id', 'name'];
      let validRecords = 0;
      let invalidRecords = [];
      
      for (let i = 0; i < backupData.data.length; i++) {
        const record = backupData.data[i];
        const missingFields = requiredFields.filter(field => !record[field]);
        
        if (missingFields.length === 0) {
          validRecords++;
        } else {
          invalidRecords.push({
            index: i,
            id: record.id || 'unknown',
            missingFields
          });
        }
      }
      
      return {
        success: true,
        backupId,
        isValid: invalidRecords.length === 0,
        totalRecords: backupData.data.length,
        validRecords,
        invalidRecords,
        issues: invalidRecords.length > 0 ? 
          `${invalidRecords.length} registros con campos faltantes` : 
          null
      };
      
    } catch (error) {
      return {
        success: false,
        backupId,
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Ejecutar operación con rollback automático en caso de error
   * @param {Function} operation - Función a ejecutar
   * @param {string} operationName - Nombre de la operación (para logging)
   * @returns {object} Resultado de la operación
   */
  async executeWithRollback(operation, operationName = 'Operación') {
    let restorePoint = null;
    
    try {
      logger.info(`🔄 ${operationName}: Creando punto de restauración...`);
      restorePoint = await this.createRestorePoint();
      
      if (!restorePoint.success) {
        throw new Error('No se pudo crear punto de restauración');
      }
      
      logger.info(`🔄 ${operationName}: Ejecutando operación...`);
      const result = await operation();
      
      logger.info(`✅ ${operationName}: Operación completada exitosamente`);
      return {
        success: true,
        operation: operationName,
        result,
        restorePoint: restorePoint.backupId
      };
      
    } catch (error) {
      logger.error(`❌ ${operationName}: Error durante la operación:`, error.message);
      
      // Intentar rollback si hay punto de restauración
      if (restorePoint && restorePoint.success) {
        logger.info(`🔄 ${operationName}: Intentando rollback...`);
        
        try {
          const rollbackResult = await this.restoreFromBackup(restorePoint.backupId);
          
          if (rollbackResult.success) {
            logger.info(`✅ ${operationName}: Rollback completado exitosamente`);
          } else {
            logger.error(`❌ ${operationName}: Falló el rollback:`, rollbackResult.error);
          }
          
          return {
            success: false,
            operation: operationName,
            error: error.message,
            rollbackAttempted: true,
            rollbackSuccess: rollbackResult.success,
            rollbackError: rollbackResult.error
          };
          
        } catch (rollbackError) {
          logger.error(`❌ ${operationName}: Error durante rollback:`, rollbackError.message);
          return {
            success: false,
            operation: operationName,
            error: error.message,
            rollbackAttempted: true,
            rollbackSuccess: false,
            rollbackError: rollbackError.message
          };
        }
      }
      
      return {
        success: false,
        operation: operationName,
        error: error.message,
        rollbackAttempted: false
      };
    }
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  (async () => {
    const manager = new BackupRestoreManager();
    const command = process.argv[2];
    
    switch (command) {
      case 'create':
        const backupName = process.argv[3] || null;
        const result = await manager.createBackup(backupName);
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'restore':
        const backupId = process.argv[3];
        if (!backupId) {
          console.error('❌ Error: Se requiere ID del backup');
          process.exit(1);
        }
        const restoreResult = await manager.restoreFromBackup(backupId);
        console.log(JSON.stringify(restoreResult, null, 2));
        break;
        
      case 'list':
        const backups = await manager.listBackups();
        console.log('📋 Backups disponibles:');
        backups.forEach((backup, i) => {
          console.log(`  ${i + 1}. ${backup.backupId}`);
          console.log(`     • Fecha: ${backup.timestamp}`);
          console.log(`     • Registros: ${backup.recordCount}`);
          console.log(`     • Tamaño: ${(backup.size / 1024).toFixed(2)} KB`);
          console.log();
        });
        break;
        
      case 'verify':
        const verifyId = process.argv[3];
        if (!verifyId) {
          console.error('❌ Error: Se requiere ID del backup');
          process.exit(1);
        }
        const verifyResult = await manager.verifyBackup(verifyId);
        console.log(JSON.stringify(verifyResult, null, 2));
        break;
        
      case 'restore-point':
        const pointResult = await manager.createRestorePoint();
        console.log(JSON.stringify(pointResult, null, 2));
        break;
        
      default:
        console.log('📖 Uso: node backupRestoreClients.js <comando> [argumentos]');
        console.log();
        console.log('Comandos disponibles:');
        console.log('  create [nombre]     - Crear backup (opcional: nombre personalizado)');
        console.log('  restore <id>        - Restaurar desde backup');
        console.log('  list                - Listar backups disponibles');
        console.log('  verify <id>         - Verificar integridad de backup');
        console.log('  restore-point       - Crear punto de restauración rápido');
        console.log();
        console.log('Ejemplos:');
        console.log('  node backupRestoreClients.js create');
        console.log('  node backupRestoreClients.js create "backup-pre-migration"');
        console.log('  node backupRestoreClients.js restore "clients-backup-2024-..."');
        console.log('  node backupRestoreClients.js list');
        break;
    }
    
    process.exit(0);
  })().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = BackupRestoreManager;