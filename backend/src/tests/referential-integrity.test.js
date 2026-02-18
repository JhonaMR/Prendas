/**
 * Test de integridad referencial para clientsService.js
 * 
 * Este test verifica que las restricciones de integridad referencial
 * funcionen correctamente con el esquema corregido.
 * 
 * Validates: Requirements 2.4
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

describe('Referential Integrity Tests', () => {
  // Datos de prueba
  const testClient = {
    id: 'test-ref-integrity-' + Date.now(),
    name: 'Cliente de Prueba Integridad',
    nit: '9876543210',
    address: 'Calle Integridad 123',
    city: 'Ciudad Integridad'
  };

  const validSellerId = 'test-seller-valid-' + Date.now();
  const invalidSellerId = 'test-seller-invalid-' + Date.now();

  beforeAll(async () => {
    console.log('🔌 Inicializando base de datos para pruebas de integridad...');
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
      
      // Verificar que la tabla sellers existe
      const sellersCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sellers'
        );
      `);
      
      if (!sellersCheck.rows[0].exists) {
        console.log('⚠️ Tabla sellers no existe, creando...');
        await query(`
          CREATE TABLE IF NOT EXISTS sellers (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ Tabla sellers creada');
      }
      
      // Crear un vendedor válido para pruebas
      await query(`
        INSERT INTO sellers (id, name)
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING
      `, [validSellerId, 'Vendedor Válido']);
      console.log(`✅ Vendedor válido creado: ${validSellerId}`);
      
      // Limpiar datos de prueba anteriores
      await query('DELETE FROM clients WHERE id LIKE $1', ['test-ref-integrity-%']);
      console.log('✅ Datos de prueba anteriores limpiados');
      
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      await query('DELETE FROM clients WHERE id LIKE $1', ['test-ref-integrity-%']);
      await query('DELETE FROM sellers WHERE id LIKE $1', ['test-seller-%']);
      console.log('🧹 Datos de prueba limpiados');
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error.message);
    }
  });

  describe('1. Creación de cliente con seller_id válido', () => {
    test('debe crear cliente exitosamente con seller_id válido', async () => {
      console.log('🧪 Probando creación con seller_id válido...');
      
      try {
        const clientData = {
          ...testClient,
          seller_id: validSellerId
        };
        
        const createdClient = await clientsService.createClient(clientData);
        
        // Verificar que el cliente fue creado
        expect(createdClient).toBeDefined();
        expect(createdClient.id).toBe(clientData.id);
        expect(createdClient.seller_id).toBe(validSellerId);
        
        console.log(`✅ Cliente creado exitosamente con seller_id válido: ${createdClient.id}`);
        
        // Verificar en la base de datos
        const dbCheck = await query('SELECT * FROM clients WHERE id = $1', [clientData.id]);
        expect(dbCheck.rows.length).toBe(1);
        expect(dbCheck.rows[0].seller_id).toBe(validSellerId);
        
        console.log('✅ Integridad referencial verificada en base de datos');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('2. Creación de cliente con seller_id inválido', () => {
    test('debe fallar al crear cliente con seller_id que no existe', async () => {
      console.log('🧪 Probando creación con seller_id inválido...');
      
      try {
        const clientData = {
          ...testClient,
          id: 'test-invalid-seller-' + Date.now(),
          seller_id: invalidSellerId
        };
        
        // Esto debería fallar porque el seller_id no existe
        await expect(clientsService.createClient(clientData))
          .rejects
          .toThrow();
        
        console.log('✅ Correctamente falló al crear cliente con seller_id inválido');
        
        // Verificar que el cliente NO fue creado
        const dbCheck = await query('SELECT id FROM clients WHERE id = $1', [clientData.id]);
        expect(dbCheck.rows.length).toBe(0);
        
        console.log('✅ Verificado que el cliente no fue creado');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });

    test('el error debe ser descriptivo', async () => {
      console.log('🧪 Probando mensaje de error descriptivo...');
      
      try {
        const clientData = {
          ...testClient,
          id: 'test-error-message-' + Date.now(),
          seller_id: invalidSellerId
        };
        
        let errorMessage = '';
        try {
          await clientsService.createClient(clientData);
        } catch (error) {
          errorMessage = error.message;
        }
        
        // Verificar que el error sea descriptivo
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toBeGreaterThan(0);
        
        console.log(`✅ Error descriptivo recibido: "${errorMessage.substring(0, 50)}..."`);
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('3. Actualización de cliente con seller_id inválido', () => {
    test('debe fallar al actualizar cliente con seller_id que no existe', async () => {
      console.log('🧪 Probando actualización con seller_id inválido...');
      
      try {
        // Primero crear un cliente sin seller_id
        const clientId = 'test-update-invalid-' + Date.now();
        const initialClient = {
          id: clientId,
          name: 'Cliente para Actualizar',
          nit: '1111111111',
          address: 'Dirección Inicial',
          city: 'Ciudad Inicial'
        };
        
        await clientsService.createClient(initialClient);
        console.log(`✅ Cliente creado para prueba de actualización: ${clientId}`);
        
        // Intentar actualizar con seller_id inválido
        const updateData = {
          seller_id: invalidSellerId
        };
        
        // Esto debería fallar porque el seller_id no existe
        await expect(clientsService.updateClient(clientId, updateData))
          .rejects
          .toThrow();
        
        console.log('✅ Correctamente falló al actualizar con seller_id inválido');
        
        // Verificar que el cliente NO fue actualizado
        const dbCheck = await query('SELECT seller_id FROM clients WHERE id = $1', [clientId]);
        expect(dbCheck.rows[0].seller_id).toBeNull();
        
        console.log('✅ Verificado que el cliente no fue actualizado');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('4. Actualización de cliente con seller_id válido', () => {
    test('debe actualizar exitosamente con seller_id válido', async () => {
      console.log('🧪 Probando actualización con seller_id válido...');
      
      try {
        // Crear un cliente sin seller_id
        const clientId = 'test-update-valid-' + Date.now();
        const initialClient = {
          id: clientId,
          name: 'Cliente para Actualizar Válido',
          nit: '2222222222',
          address: 'Dirección Inicial Válida',
          city: 'Ciudad Inicial Válida'
        };
        
        await clientsService.createClient(initialClient);
        console.log(`✅ Cliente creado para prueba de actualización válida: ${clientId}`);
        
        // Actualizar con seller_id válido
        const updateData = {
          seller_id: validSellerId
        };
        
        const updatedClient = await clientsService.updateClient(clientId, updateData);
        
        // Verificar que el cliente fue actualizado
        expect(updatedClient).toBeDefined();
        expect(updatedClient.seller_id).toBe(validSellerId);
        
        console.log(`✅ Cliente actualizado exitosamente con seller_id válido: ${updatedClient.id}`);
        
        // Verificar en la base de datos
        const dbCheck = await query('SELECT seller_id FROM clients WHERE id = $1', [clientId]);
        expect(dbCheck.rows[0].seller_id).toBe(validSellerId);
        
        console.log('✅ Actualización verificada en base de datos');
        
      } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        throw error;
      }
    });
  });

  describe('5. Verificación de restricción FOREIGN KEY', () => {
    test('debe verificar que la restricción FOREIGN KEY está activa', async () => {
      console.log('🧪 Verificando restricción FOREIGN KEY...');
      
      try {
        // Consultar información de restricciones
        const constraints = await query(`
          SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
          WHERE 
            tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = 'clients'
            AND kcu.column_name = 'seller_id';
        `);
        
        // Verificar que existe la restricción
        expect(constraints.rows.length).toBeGreaterThan(0);
        
        const constraint = constraints.rows[0];
        console.log(`✅ Restricción FOREIGN KEY encontrada: ${constraint.constraint_name}`);
        console.log(`   • Tabla: ${constraint.table_name}`);
        console.log(`   • Columna: ${constraint.column_name}`);
        console.log(`   • Referencia: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        
        // Verificar que apunta a la tabla correcta
        expect(constraint.foreign_table_name).toBe('sellers');
        expect(constraint.foreign_column_name).toBe('id');
        
        console.log('✅ Restricción FOREIGN KEY verificada correctamente');
        
      } catch (error) {
        console.error('❌ Error verificando restricciones:', error.message);
        throw error;
      }
    });
  });
});

console.log('\n' + '='.repeat(80));
console.log('✅ SCRIPT DE PRUEBA DE INTEGRIDAD REFERENCIAL CREADO');
console.log('='.repeat(80) + '\n');