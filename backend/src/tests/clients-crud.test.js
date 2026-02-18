/**
 * Test de operaciones CRUD para clientsService.js
 * 
 * Este test verifica que las operaciones CRUD funcionen correctamente
 * con el esquema corregido de la tabla clients en PostgreSQL.
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { initDatabase, query } = require('../config/database');
const clientsService = require('../controllers/entities/clients/clientsService');
const logger = require('../controllers/shared/logger');

// Desactivar logging durante las pruebas para evitar ruido
logger.info = jest.fn();
logger.error = jest.fn();
logger.debug = jest.fn();

// Mock de cache invalidation service
jest.mock('../services/CacheInvalidationService', () => ({
  invalidateOnCreate: jest.fn(),
  invalidateOnUpdate: jest.fn(),
  invalidateOnDelete: jest.fn()
}));

// Mock de seller validator
jest.mock('../controllers/entities/clients/sellerValidator', () => ({
  validateSellerId: jest.fn().mockResolvedValue({ valid: true, error: null })
}));

describe('Clients Service CRUD Operations', () => {
  // Datos de prueba
  const testClient = {
    id: 'test-client-' + Date.now(),
    name: 'Cliente de Prueba',
    nit: '1234567890',
    address: 'Calle Falsa 123',
    city: 'Ciudad de Prueba',
    seller_id: 'test-seller-001'
  };

  const updatedClientData = {
    name: 'Cliente Actualizado',
    nit: '9876543210',
    address: 'Nueva Dirección 456',
    city: 'Nueva Ciudad',
    seller_id: 'test-seller-002'
  };

  beforeAll(async () => {
    console.log('🔌 Inicializando base de datos para pruebas...');
    try {
      await initDatabase();
      console.log('✅ Base de datos inicializada');
      
      // Verificar que la tabla clients existe
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'clients'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('⚠️ Tabla clients no existe, creando...');
        await query(`
          CREATE TABLE IF NOT EXISTS clients (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            nit VARCHAR(50),
            address TEXT,
            city VARCHAR(100),
            seller_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tabla clients creada');
      }
      
      // Limpiar datos de prueba anteriores
      await query('DELETE FROM clients WHERE id LIKE $1', ['test-client-%']);
      console.log('✅ Datos de prueba anteriores limpiados');
      
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      await query('DELETE FROM clients WHERE id LIKE $1', ['test-client-%']);
      console.log('🧹 Datos de prueba limpiados');
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error.message);
    }
  });

  describe('1. getAllClients()', () => {
    test('debe ejecutar getAllClients() sin errores', async () => {
      console.log('🧪 Probando getAllClients()...');
      
      try {
        const clients = await clientsService.getAllClients();
        
        // Verificar que no hay errores
        expect(clients).toBeDefined();
        expect(Array.isArray(clients)).toBe(true);
        
        console.log(`✅ getAllClients() ejecutado correctamente. Clientes encontrados: ${clients.length}`);
        
        // Verificar estructura de datos si hay clientes
        if (clients.length > 0) {
          const firstClient = clients[0];
          expect(firstClient).toHaveProperty('id');
          expect(firstClient).toHaveProperty('name');
          expect(firstClient).toHaveProperty('nit');
          expect(firstClient).toHaveProperty('address');
          expect(firstClient).toHaveProperty('city');
          expect(firstClient).toHaveProperty('seller_id');
          
          console.log('✅ Estructura de datos validada correctamente');
        }
        
      } catch (error) {
        console.error('❌ Error en getAllClients():', error.message);
        throw error;
      }
    });
  });

  describe('2. createClient()', () => {
    test('debe crear un cliente con datos de prueba', async () => {
      console.log('🧪 Probando createClient()...');
      
      try {
        const createdClient = await clientsService.createClient(testClient);
        
        // Verificar que el cliente fue creado
        expect(createdClient).toBeDefined();
        expect(createdClient.id).toBe(testClient.id);
        expect(createdClient.name).toBe(testClient.name);
        expect(createdClient.nit).toBe(testClient.nit);
        expect(createdClient.address).toBe(testClient.address);
        expect(createdClient.city).toBe(testClient.city);
        expect(createdClient.seller_id).toBe(testClient.seller_id);
        
        console.log(`✅ Cliente creado correctamente: ${createdClient.id}`);
        
        // Verificar en la base de datos
        const dbCheck = await query('SELECT * FROM clients WHERE id = $1', [testClient.id]);
        expect(dbCheck.rows.length).toBe(1);
        expect(dbCheck.rows[0].id).toBe(testClient.id);
        
        console.log('✅ Cliente verificado en base de datos');
        
      } catch (error) {
        console.error('❌ Error en createClient():', error.message);
        throw error;
      }
    });
  });

  describe('3. updateClient()', () => {
    test('debe actualizar un cliente con todas las columnas', async () => {
      console.log('🧪 Probando updateClient()...');
      
      try {
        // Primero crear el cliente si no existe
        const existingCheck = await query('SELECT id FROM clients WHERE id = $1', [testClient.id]);
        if (existingCheck.rows.length === 0) {
          await clientsService.createClient(testClient);
        }
        
        // Actualizar todas las columnas
        const updatedClient = await clientsService.updateClient(testClient.id, updatedClientData);
        
        // Verificar que el cliente fue actualizado
        expect(updatedClient).toBeDefined();
        expect(updatedClient.id).toBe(testClient.id);
        expect(updatedClient.name).toBe(updatedClientData.name);
        expect(updatedClient.nit).toBe(updatedClientData.nit);
        expect(updatedClient.address).toBe(updatedClientData.address);
        expect(updatedClient.city).toBe(updatedClientData.city);
        expect(updatedClient.seller_id).toBe(updatedClientData.seller_id);
        
        console.log(`✅ Cliente actualizado correctamente: ${updatedClient.id}`);
        
        // Verificar en la base de datos
        const dbCheck = await query('SELECT * FROM clients WHERE id = $1', [testClient.id]);
        expect(dbCheck.rows.length).toBe(1);
        expect(dbCheck.rows[0].name).toBe(updatedClientData.name);
        expect(dbCheck.rows[0].nit).toBe(updatedClientData.nit);
        expect(dbCheck.rows[0].address).toBe(updatedClientData.address);
        expect(dbCheck.rows[0].city).toBe(updatedClientData.city);
        expect(dbCheck.rows[0].seller_id).toBe(updatedClientData.seller_id);
        
        console.log('✅ Actualización verificada en base de datos');
        
      } catch (error) {
        console.error('❌ Error en updateClient():', error.message);
        throw error;
      }
    });

    test('debe actualizar columnas individualmente', async () => {
      console.log('🧪 Probando updateClient() con columnas individuales...');
      
      try {
        // Actualizar solo el nombre
        const nameUpdate = { name: 'Cliente con Nombre Actualizado' };
        const updatedClient = await clientsService.updateClient(testClient.id, nameUpdate);
        
        expect(updatedClient.name).toBe(nameUpdate.name);
        console.log('✅ Nombre actualizado correctamente');
        
        // Actualizar solo el NIT
        const nitUpdate = { nit: '5555555555' };
        const updatedClient2 = await clientsService.updateClient(testClient.id, nitUpdate);
        
        expect(updatedClient2.nit).toBe(nitUpdate.nit);
        console.log('✅ NIT actualizado correctamente');
        
        // Actualizar solo la dirección
        const addressUpdate = { address: 'Otra Dirección 789' };
        const updatedClient3 = await clientsService.updateClient(testClient.id, addressUpdate);
        
        expect(updatedClient3.address).toBe(addressUpdate.address);
        console.log('✅ Dirección actualizada correctamente');
        
        // Actualizar solo la ciudad
        const cityUpdate = { city: 'Otra Ciudad' };
        const updatedClient4 = await clientsService.updateClient(testClient.id, cityUpdate);
        
        expect(updatedClient4.city).toBe(cityUpdate.city);
        console.log('✅ Ciudad actualizada correctamente');
        
        // Actualizar solo el seller_id
        const sellerUpdate = { seller_id: 'test-seller-003' };
        const updatedClient5 = await clientsService.updateClient(testClient.id, sellerUpdate);
        
        expect(updatedClient5.seller_id).toBe(sellerUpdate.seller_id);
        console.log('✅ Seller ID actualizado correctamente');
        

        
      } catch (error) {
        console.error('❌ Error en updateClient() individual:', error.message);
        throw error;
      }
    });
  });

  describe('4. deleteClient()', () => {
    test('debe eliminar un cliente y verificar eliminación', async () => {
      console.log('🧪 Probando deleteClient()...');
      
      try {
        // Primero crear un cliente para eliminar
        const deleteTestClient = {
          id: 'delete-test-' + Date.now(),
          name: 'Cliente a Eliminar',
          nit: '9999999999',
          address: 'Dirección a Eliminar',
          city: 'Ciudad a Eliminar',
          seller_id: 'test-seller-delete'
        };
        
        await clientsService.createClient(deleteTestClient);
        console.log(`✅ Cliente creado para eliminación: ${deleteTestClient.id}`);
        
        // Verificar que existe antes de eliminar
        const beforeDelete = await query('SELECT id FROM clients WHERE id = $1', [deleteTestClient.id]);
        expect(beforeDelete.rows.length).toBe(1);
        
        // Eliminar el cliente
        await clientsService.deleteClient(deleteTestClient.id);
        console.log(`✅ Cliente eliminado: ${deleteTestClient.id}`);
        
        // Verificar que fue eliminado
        const afterDelete = await query('SELECT id FROM clients WHERE id = $1', [deleteTestClient.id]);
        expect(afterDelete.rows.length).toBe(0);
        
        console.log('✅ Eliminación verificada en base de datos');
        
      } catch (error) {
        console.error('❌ Error en deleteClient():', error.message);
        throw error;
      }
    });

    test('debe lanzar error al eliminar cliente inexistente', async () => {
      console.log('🧪 Probando deleteClient() con cliente inexistente...');
      
      try {
        const nonExistentId = 'non-existent-' + Date.now();
        await expect(clientsService.deleteClient(nonExistentId))
          .rejects
          .toThrow();
        
        console.log('✅ Error lanzado correctamente para cliente inexistente');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('5. getClientById()', () => {
    test('debe obtener un cliente por ID', async () => {
      console.log('🧪 Probando getClientById()...');
      
      try {
        const client = await clientsService.getClientById(testClient.id);
        
        expect(client).toBeDefined();
        expect(client.id).toBe(testClient.id);
        expect(client).toHaveProperty('name');
        expect(client).toHaveProperty('nit');
        expect(client).toHaveProperty('address');
        expect(client).toHaveProperty('city');
        expect(client).toHaveProperty('seller_id');
        
        console.log(`✅ Cliente obtenido por ID: ${client.id}`);
        
      } catch (error) {
        console.error('❌ Error en getClientById():', error.message);
        throw error;
      }
    });

    test('debe lanzar error al obtener cliente inexistente', async () => {
      console.log('🧪 Probando getClientById() con cliente inexistente...');
      
      try {
        const nonExistentId = 'non-existent-get-' + Date.now();
        await expect(clientsService.getClientById(nonExistentId))
          .rejects
          .toThrow();
        
        console.log('✅ Error lanzado correctamente para cliente inexistente');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('6. Verificación de esquema completo', () => {
    test('debe verificar que todas las columnas están presentes en consultas', async () => {
      console.log('🧪 Verificando esquema completo...');
      
      try {
        // Obtener todos los clientes
        const clients = await clientsService.getAllClients();
        
        if (clients.length > 0) {
          const client = clients[0];
          
          // Verificar todas las columnas esperadas
          const expectedColumns = ['id', 'name', 'nit', 'address', 'city', 'seller_id'];
          
          expectedColumns.forEach(column => {
            expect(client).toHaveProperty(column);
          });
          
          console.log(`✅ Todas las columnas presentes: ${expectedColumns.join(', ')}`);
        } else {
          console.log('⚠️ No hay clientes para verificar esquema');
        }
        
        // Verificar estructura de la tabla en la base de datos
        const columns = await query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = 'clients'
          ORDER BY ordinal_position;
        `);
        
        const columnNames = columns.rows.map(col => col.column_name);
        const expectedColumnNames = ['id', 'name', 'nit', 'address', 'city', 'seller_id', 'created_at', 'updated_at'];
        
        expectedColumnNames.forEach(expectedColumn => {
          expect(columnNames).toContain(expectedColumn);
        });
        
        console.log(`✅ Esquema de tabla verificado: ${columnNames.join(', ')}`);
        
      } catch (error) {
        console.error('❌ Error verificando esquema:', error.message);
        throw error;
      }
    });
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ SCRIPT DE PRUEBA CRUD PARA CLIENTSERVICE.JS CREADO');
console.log('='.repeat(80) + '\n');