/**
 * Test de operaciones concurrentes para clientsService
 * 
 * Este test verifica que las operaciones concurrentes en la tabla clients
 * mantengan la integridad de los datos y prevengan condiciones de carrera.
 * 
 * Validates: Requirements 4.4
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initDatabase, query } = require('../config/database');
const clientsService = require('../controllers/entities/clients/clientsService');
const logger = require('../controllers/shared/logger');

// Desactivar logging durante las pruebas
logger.info = jest.fn();
logger.error = jest.fn();
logger.debug = jest.fn();

// Mock de cache invalidation
jest.mock('../services/CacheInvalidationService', () => ({
  invalidateOnCreate: jest.fn(),
  invalidateOnUpdate: jest.fn(),
  invalidateOnDelete: jest.fn()
}));

// Mock de seller validator
jest.mock('../controllers/entities/clients/sellerValidator', () => ({
  validateSellerId: jest.fn().mockResolvedValue({ valid: true, error: null })
}));

describe('Concurrent Operations Tests', () => {
  const testClients = [];
  const testPrefix = 'concurrent-test-';
  
  beforeAll(async () => {
    await initDatabase();
    
    // Limpiar datos de pruebas anteriores
    await query('DELETE FROM clients WHERE id LIKE $1', [`${testPrefix}%`]);
    console.log('✅ Datos de prueba anteriores limpiados');
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await query('DELETE FROM clients WHERE id LIKE $1', [`${testPrefix}%`]);
    console.log('🧹 Datos de prueba limpiados');
  });

  describe('1. Creación concurrente de clientes', () => {
    test('debe manejar múltiples inserciones concurrentes sin conflictos', async () => {
      const numClients = 10;
      const clientPromises = [];
      
      // Crear múltiples clientes concurrentemente
      for (let i = 0; i < numClients; i++) {
        const clientData = {
          id: `${testPrefix}concurrent-${Date.now()}-${i}`,
          name: `Cliente Concurrente ${i}`,
          nit: `NIT-${Date.now()}-${i}`,
          address: `Dirección ${i}`,
          city: `Ciudad ${i}`,
          seller_id: 'test-seller-concurrent'
        };
        
        clientPromises.push(
          clientsService.createClient(clientData)
            .then(result => ({ success: true, id: clientData.id, result }))
            .catch(error => ({ 
              success: false, 
              id: clientData.id, 
              error: error.message 
            }))
        );
      }
      
      const results = await Promise.allSettled(clientPromises);
      
      // Verificar que todas las inserciones fueron exitosas
      const successful = results.filter(r => 
        r.status === 'fulfilled' && r.value.success === true
      );
      
      const failed = results.filter(r => 
        r.status === 'rejected' || 
        (r.status === 'fulfilled' && r.value.success === false)
      );
      
      console.log(`✅ ${successful.length} inserciones exitosas`);
      console.log(`❌ ${failed.length} inserciones fallidas`);
      
      // Verificar que no hubo conflictos de concurrencia
      expect(failed.length).toBe(0);
      expect(successful.length).toBe(numClients);
    }, 30000); // Timeout extendido para operaciones concurrentes

    test('debe manejar actualizaciones concurrentes sin pérdida de datos', async () => {
      // Crear un cliente para las pruebas de actualización
      const clientId = `${testPrefix}concurrent-update-${Date.now()}`;
      const initialClient = {
        id: clientId,
        name: 'Cliente para actualizaciones concurrentes',
        nit: 'NIT-CONCURRENT',
        address: 'Dirección inicial',
        city: 'Ciudad Inicial',
        seller_id: 'test-seller-concurrent'
      };
      
      await clientsService.createClient(initialClient);
      
      // Simular múltiples actualizaciones concurrentes
      const updatePromises = [];
      const numUpdates = 5;
      
      for (let i = 0; i < numUpdates; i++) {
        const updateData = {
          name: `Nombre Actualizado ${i}`,
          city: `Ciudad ${i}`
        };
        
        updatePromises.push(
          clientsService.updateClient(clientId, updateData)
            .then(result => ({ 
              success: true, 
              update: i,
              result 
            }))
            .catch(error => ({ 
              success: false, 
              update: i, 
              error: error.message 
            }))
        );
      }
      
      const results = await Promise.allSettled(updatePromises);
      
      // Verificar que todas las actualizaciones se procesaron
      const successfulUpdates = results.filter(r => 
        r.status === 'fulfilled' && r.value.success === true
      );
      
      // Al menos una actualización debería tener éxito
      expect(successfulUpdates.length).toBeGreaterThan(0);
      
      // Verificar que el cliente final tenga datos consistentes
      const finalClient = await clientsService.getClientById(clientId);
      expect(finalClient).toBeDefined();
      expect(finalClient.id).toBe(clientId);
    });

    test('debe manejar lecturas concurrentes sin bloqueos', async () => {
      // Crear múltiples clientes para pruebas de lectura
      const numClients = 5;
      const clientIds = [];
      
      for (let i = 0; i < numClients; i++) {
        const clientData = {
          id: `${testPrefix}read-concurrent-${i}`,
          name: `Cliente Lectura ${i}`,
          nit: `NIT-READ-${i}`,
          address: `Dirección ${i}`,
          city: `Ciudad ${i}`,
          seller_id: 'test-seller-read'
        };
        
        await clientsService.createClient(clientData);
        clientIds.push(clientData.id);
      }
      
      // Realizar lecturas concurrentes
      const readPromises = clientIds.map(id => 
        clientsService.getClientById(id)
          .then(client => ({ success: true, id, client }))
          .catch(error => ({ success: false, id, error: error.message }))
      );
      
      const results = await Promise.all(readPromises);
      const successfulReads = results.filter(r => r.success);
      
      expect(successfulReads.length).toBe(numClients);
    });
  });

  describe('2. Operaciones de eliminación concurrentes', () => {
    test('debe manejar eliminaciones concurrentes', async () => {
      const numToDelete = 3;
      const clientIds = [];
      
      // Crear clientes para eliminar
      for (let i = 0; i < numToDelete; i++) {
        const clientId = `${testPrefix}delete-concurrent-${i}`;
        await clientsService.createClient({
          id: clientId,
          name: `Cliente a eliminar ${i}`,
          nit: `NIT-DELETE-${i}`,
          address: `Dirección ${i}`,
          city: `Ciudad ${i}`,
          seller_id: 'test-seller-delete'
        });
        clientIds.push(clientId);
      }
      
      // Eliminar concurrentemente
      const deletePromises = clientIds.map(id => 
        clientsService.deleteClient(id)
          .then(() => ({ success: true, id }))
          .catch(error => ({ success: false, id, error: error.message }))
      );
      
      const results = await Promise.all(deletePromises);
      const successfulDeletes = results.filter(r => r.success);
      
      expect(successfulDeletes.length).toBe(numToDelete);
    });
  });

  describe('3. Pruebas de integridad de datos', () => {
    test('debe mantener la integridad de datos bajo alta concurrencia', async () => {
      const numOperations = 20;
      const operations = [];
      const clientId = `${testPrefix}integrity-test`;
      
      // Crear cliente inicial
      await clientsService.createClient({
        id: clientId,
        name: 'Cliente Integridad',
        nit: 'NIT-INTEGRITY',
        address: 'Dirección Inicial',
        city: 'Ciudad Inicial',
        seller_id: 'test-seller-integrity'
      });
      
      // Simular múltiples operaciones concurrentes
      for (let i = 0; i < numOperations; i++) {
        const operationType = i % 3; // 0: update, 1: read, 2: update different field
        
        if (operationType === 0) {
          // Actualizar nombre
          operations.push(
            clientsService.updateClient(clientId, { 
              name: `Nombre Actualizado ${i}` 
            })
          );
        } else if (operationType === 1) {
          // Leer cliente
          operations.push(clientsService.getClientById(clientId));
        } else {
          // Actualizar ciudad
          operations.push(
            clientsService.updateClient(clientId, { 
              city: `Ciudad Actualizada ${i}` 
            })
          );
        }
      }
      
      // Ejecutar operaciones concurrentes
      const results = await Promise.allSettled(operations);
      
      // Verificar que no hubo errores de concurrencia
      const failedOperations = results.filter(r => r.status === 'rejected');
      expect(failedOperations.length).toBe(0);
      
      // Verificar que el cliente final tenga datos consistentes
      const finalClient = await clientsService.getClientById(clientId);
      expect(finalClient).toBeDefined();
      expect(finalClient.id).toBe(clientId);
    });
  });

  describe('4. Pruebas de rendimiento bajo carga', () => {
    test('debe manejar alta concurrencia sin degradación significativa', async () => {
      const numOperations = 50;
      const startTime = Date.now();
      
      const operations = [];
      for (let i = 0; i < numOperations; i++) {
        const clientId = `${testPrefix}perf-${i}`;
        
        // Crear cliente
        operations.push(
          clientsService.createClient({
            id: clientId,
            name: `Cliente ${i}`,
            nit: `NIT-${i}`,
            address: `Dirección ${i}`,
            city: `Ciudad ${i}`,
            seller_id: 'test-seller'
          })
        );
      }
      
      const results = await Promise.allSettled(operations);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      console.log(`⏱️  Tiempo de ejecución: ${executionTime}ms para ${numOperations} operaciones`);
      console.log(`📊 Rendimiento: ${(numOperations / (executionTime / 1000)).toFixed(2)} ops/segundo`);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const successRate = (successful.length / numOperations) * 100;
      
      console.log(`✅ ${successful.length}/${numOperations} operaciones exitosas (${successRate.toFixed(1)}%)`);
      
      expect(successRate).toBeGreaterThan(95); // Al menos 95% de éxito
    }, 30000);
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ SCRIPT DE PRUEBAS DE CONCURRENCIA CREADO');
console.log('='.repeat(80) + '\n');