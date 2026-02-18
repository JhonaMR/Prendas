/**
 * Test del sistema de backup y restauración
 * 
 * Este test verifica que el sistema de backup y restauración
 * funcione correctamente para la tabla clients.
 * 
 * Validates: Requirements 5.5
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initDatabase, query } = require('../config/database');
const BackupRestoreManager = require('../scripts/backupRestoreClients');
const fs = require('fs').promises;
const path = require('path');

// Mock de logger para evitar ruido en tests
jest.mock('../controllers/shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Backup and Restore System Tests', () => {
  let manager;
  let testBackupDir;
  
  beforeAll(async () => {
    await initDatabase();
    
    // Configurar directorio de pruebas para backups
    testBackupDir = path.join(__dirname, '../../backups-test');
    
    // Limpiar directorio de pruebas si existe
    try {
      await fs.rm(testBackupDir, { recursive: true, force: true });
    } catch (error) {
      // Ignorar si no existe
    }
    
    // Crear manager con directorio de pruebas
    manager = new BackupRestoreManager(testBackupDir);
    
    // Limpiar datos de prueba
    await query('DELETE FROM clients WHERE id LIKE $1', ['test-backup-%']);
  });
  
  afterAll(async () => {
    // Limpiar directorio de pruebas
    try {
      await fs.rm(testBackupDir, { recursive: true, force: true });
    } catch (error) {
      // Ignorar errores
    }
    
    // Limpiar datos de prueba
    await query('DELETE FROM clients WHERE id LIKE $1', ['test-backup-%']);
  });
  
  beforeEach(async () => {
    // Limpiar directorio de pruebas antes de cada test
    try {
      await fs.rm(testBackupDir, { recursive: true, force: true });
    } catch (error) {
      // Ignorar si no existe
    }
    
    // Recrear manager para usar directorio limpio
    manager = new BackupRestoreManager();
  });
  
  describe('1. Creación de backup', () => {
    test('debe crear backup exitosamente', async () => {
      const result = await manager.createBackup('test-backup');
      
      expect(result.success).toBe(true);
      expect(result.backupId).toBe('test-backup');
      expect(result.recordCount).toBeGreaterThan(0); // Ya hay datos de la migración
      expect(result.timestamp).toBeDefined();
    });
    
    test('debe crear backup con datos adicionales de clientes', async () => {
      // Obtener conteo actual
      const currentCountResult = await query('SELECT COUNT(*) as count FROM clients');
      const currentCount = parseInt(currentCountResult.rows[0].count);
      
      // Crear datos de prueba adicionales
      await query(`
        INSERT INTO clients (id, name, nit, address, city, seller_id)
        VALUES 
          ('test-backup-1', 'Cliente Backup 1', 'NIT-001', 'Dirección 1', 'Ciudad 1', 'seller-1'),
          ('test-backup-2', 'Cliente Backup 2', 'NIT-002', 'Dirección 2', 'Ciudad 2', 'seller-2')
      `);
      
      const result = await manager.createBackup('test-data-backup');
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(currentCount + 2); // Los existentes + 2 nuevos
    });
    
    test('debe generar nombre automático si no se proporciona', async () => {
      const result = await manager.createBackup();
      
      expect(result.success).toBe(true);
      expect(result.backupId).toMatch(/^clients-backup-/);
      expect(result.backupFile).toMatch(/\.json$/);
    });
  });
  
  describe('2. Restauración desde backup', () => {
    test('debe restaurar desde backup exitosamente', async () => {
      // Obtener conteo actual antes del backup
      const countBeforeBackup = await query('SELECT COUNT(*) as count FROM clients');
      const initialCount = parseInt(countBeforeBackup.rows[0].count);
      
      // Crear backup con datos actuales
      const backupResult = await manager.createBackup('test-restore-backup');
      expect(backupResult.success).toBe(true);
      
      // Agregar un cliente adicional para verificar después
      await query(`
        INSERT INTO clients (id, name, nit, address, city, seller_id)
        VALUES ('test-restore-new', 'Cliente Nuevo', 'NIT-NEW', 'Dirección Nueva', 'Ciudad Nueva', 'seller-new')
      `);
      
      // Verificar que el nuevo cliente existe
      const checkNew = await query('SELECT COUNT(*) as count FROM clients WHERE id = $1', ['test-restore-new']);
      expect(parseInt(checkNew.rows[0].count)).toBe(1);
      
      // Restaurar desde backup (esto eliminará el cliente nuevo)
      const restoreResult = await manager.restoreFromBackup('test-restore-backup');
      
      expect(restoreResult.success).toBe(true);
      expect(restoreResult.restoredCount).toBe(initialCount);
      
      // Verificar que el cliente nuevo fue eliminado (restaurado al estado anterior)
      const checkNewAfter = await query('SELECT COUNT(*) as count FROM clients WHERE id = $1', ['test-restore-new']);
      expect(parseInt(checkNewAfter.rows[0].count)).toBe(0);
    });
    
    test('debe fallar al intentar restaurar backup inexistente', async () => {
      const result = await manager.restoreFromBackup('non-existent-backup');
      
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Backup no encontrado/);
    });
  });
  
  describe('3. Puntos de restauración', () => {
    test('debe crear punto de restauración con nombre automático', async () => {
      const result = await manager.createRestorePoint();
      
      expect(result.success).toBe(true);
      expect(result.backupId).toMatch(/^restore-point-/);
    });
  });
  
  describe('4. Listado de backups', () => {
    test('debe listar backups disponibles', async () => {
      // Crear varios backups
      await manager.createBackup('test-list-1');
      await manager.createBackup('test-list-2');
      await manager.createRestorePoint();
      
      const backups = await manager.listBackups();
      
      expect(Array.isArray(backups)).toBe(true);
      expect(backups.length).toBeGreaterThanOrEqual(3);
      
      // Verificar estructura de cada backup
      backups.forEach(backup => {
        expect(backup).toHaveProperty('file');
        expect(backup).toHaveProperty('backupId');
        expect(backup).toHaveProperty('timestamp');
        expect(backup).toHaveProperty('recordCount');
        expect(backup).toHaveProperty('size');
        expect(backup).toHaveProperty('created');
      });
    });
    
    test('debe retornar array vacío si no hay backups', async () => {
      // Crear un manager temporal con un directorio limpio
      const tempBackupDir = path.join(__dirname, '../../backups-test-temp');
      try {
        await fs.rm(tempBackupDir, { recursive: true, force: true });
      } catch (error) {
        // Ignorar si no existe
      }
      
      const tempManager = new BackupRestoreManager(tempBackupDir);
      const backups = await tempManager.listBackups();
      
      expect(Array.isArray(backups)).toBe(true);
      expect(backups.length).toBe(0);
      
      // Limpiar
      try {
        await fs.rm(tempBackupDir, { recursive: true, force: true });
      } catch (error) {
        // Ignorar errores de limpieza
      }
    });
  });
  
  describe('5. Verificación de integridad', () => {
    test('debe verificar backup válido correctamente', async () => {
      // Crear backup válido con todos los campos requeridos
      await query(`
        INSERT INTO clients (id, name, nit, address, city, seller_id)
        VALUES ('test-verify-1', 'Cliente Verificar', 'NIT-VERIFY', 'Dirección', 'Ciudad', 'seller')
      `);
      
      const backupResult = await manager.createBackup('test-verify-backup');
      expect(backupResult.success).toBe(true);
      
      const verifyResult = await manager.verifyBackup('test-verify-backup');
      
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.isValid).toBe(true);
      expect(verifyResult.totalRecords).toBeGreaterThan(0); // Incluye todos los registros
      expect(verifyResult.validRecords).toBeGreaterThan(0);
      expect(verifyResult.invalidRecords).toHaveLength(0);
    });
    
    test('debe detectar backup inválido', async () => {
      // Asegurar que el directorio existe
      await manager.ensureBackupDir();
      
      // Crear archivo de backup inválido manualmente
      const invalidBackupFile = path.join(testBackupDir, 'invalid-backup.json');
      await fs.writeFile(invalidBackupFile, JSON.stringify({
        metadata: { backupId: 'invalid-backup' },
        // Falta el campo 'data'
      }));
      
      const verifyResult = await manager.verifyBackup('invalid-backup');
      
      expect(verifyResult.success).toBe(false);
      expect(verifyResult.isValid).toBe(false);
    });
  });
  
  describe('6. Ejecución con rollback automático', () => {
    test('debe ejecutar operación exitosa y mantener punto de restauración', async () => {
      const operation = async () => {
        await query(`
          INSERT INTO clients (id, name, nit, address, city, seller_id)
          VALUES ('test-rollback-ok', 'Cliente OK', 'NIT-OK', 'Dirección OK', 'Ciudad OK', 'seller-ok')
        `);
        return { message: 'Operación exitosa' };
      };
      
      const result = await manager.executeWithRollback(
        operation,
        'Test Operación Exitosa'
      );
      
      expect(result.success).toBe(true);
      expect(result.operation).toBe('Test Operación Exitosa');
      expect(result.restorePoint).toBeDefined();
      
      // Verificar que la operación se ejecutó
      const check = await query('SELECT * FROM clients WHERE id = $1', ['test-rollback-ok']);
      expect(check.rows.length).toBe(1);
    });
    
    test('debe ejecutar rollback cuando la operación falla', async () => {
      // Crear datos iniciales con todos los campos
      await query(`
        INSERT INTO clients (id, name, nit, address, city, seller_id)
        VALUES ('test-rollback-fail', 'Cliente Inicial', 'NIT-INITIAL', 'Dirección Inicial', 'Ciudad Inicial', 'seller-initial')
      `);
      
      const operation = async () => {
        // Esta operación fallará (clave duplicada)
        await query(`
          INSERT INTO clients (id, name, nit, address, city, seller_id)
          VALUES ('test-rollback-fail', 'Cliente Duplicado', 'NIT-DUPLICATE', 'Dirección Duplicada', 'Ciudad Duplicada', 'seller-duplicate')
        `);
        return { message: 'No debería llegar aquí' };
      };
      
      const result = await manager.executeWithRollback(
        operation,
        'Test Operación Fallida'
      );
      
      expect(result.success).toBe(false);
      expect(result.rollbackAttempted).toBe(true);
      expect(result.rollbackSuccess).toBe(true);
      
      // Verificar que los datos originales siguen intactos
      const check = await query('SELECT * FROM clients WHERE id = $1', ['test-rollback-fail']);
      expect(check.rows.length).toBe(1);
      expect(check.rows[0].name).toBe('Cliente Inicial');
    });
  });
  
  describe('7. Manejo de directorios', () => {
    test('debe crear directorio de backups si no existe', async () => {
      // Crear un directorio temporal que no existe
      const tempDir = path.join(__dirname, '../../backups-test-new-' + Date.now());
      
      // Crear manager con directorio que no existe
      const tempManager = new BackupRestoreManager(tempDir);
      
      // Intentar crear un backup (esto debería funcionar si el directorio se creó)
      const result = await tempManager.createBackup('test-dir-backup');
      
      expect(result.success).toBe(true);
      
      // Limpiar
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignorar errores de limpieza
      }
    });
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ TESTS DE SISTEMA DE BACKUP Y RESTAURACIÓN COMPLETADOS');
console.log('='.repeat(80) + '\n');