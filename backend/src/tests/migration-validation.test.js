/**
 * 🧪 Tests de validación de migración
 * 
 * Tests para verificar que la validación de migración funciona correctamente
 * 
 * Requirements: 3.3, 3.5
 */

// Mock de logger para evitar ruido en tests
jest.mock('../controllers/shared/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock de DatabaseConnectionManager
jest.mock('../config/DatabaseConnectionManager', () => ({
  getDatabaseConnectionManager: jest.fn()
}));

// Mock de database query
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const { MigrationValidator } = require('../scripts/validateMigration');

describe('🔍 Migration Validation Tests', () => {
  let validator;
  let mockSqliteDb;
  let mockPostgresQuery;
  let mockDbManager;

  beforeEach(() => {
    validator = new MigrationValidator();
    
    // Mock de SQLite
    mockSqliteDb = {
      prepare: jest.fn()
    };
    
    // Mock de PostgreSQL query
    mockPostgresQuery = jest.fn();
    
    // Mock de DatabaseConnectionManager
    mockDbManager = {
      getConnection: jest.fn(() => mockSqliteDb)
    };
    
    // Configurar mocks
    require('../config/DatabaseConnectionManager').getDatabaseConnectionManager.mockReturnValue(mockDbManager);
    require('../config/database').query.mockImplementation(mockPostgresQuery);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Validación de conteo de registros', () => {
    test('debe pasar cuando los conteos coinciden', async () => {
      // Configurar mocks
      mockSqliteDb.prepare.mockReturnValue({
        get: () => ({ count: 100 })
      });
      
      mockPostgresQuery.mockResolvedValue({
        rows: [{ count: '100' }]
      });

      const result = await validator.validateRecordCounts();
      
      expect(result.passed).toBe(true);
      expect(result.details.sqliteCount).toBe(100);
      expect(result.details.postgresCount).toBe(100);
      expect(result.details.match).toBe(true);
    });

    test('debe fallar cuando los conteos no coinciden', async () => {
      mockSqliteDb.prepare.mockReturnValue({
        get: () => ({ count: 100 })
      });
      
      mockPostgresQuery.mockResolvedValue({
        rows: [{ count: '95' }]
      });

      const result = await validator.validateRecordCounts();
      
      expect(result.passed).toBe(false);
      expect(result.details.sqliteCount).toBe(100);
      expect(result.details.postgresCount).toBe(95);
      expect(result.details.match).toBe(false);
    });
  });

  describe('✅ Transformación de registros', () => {
    test('debe transformar correctamente registros de SQLite', () => {
      const sqliteRecord = {
        id: 'test-id',
        name: 'Test Client',
        nit: '123456789',
        address: 'Test Address',
        city: 'Test City',
        seller_id: 'seller-123',
        active: 1,
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const transformed = validator.transformSqliteRecord(sqliteRecord);
      
      expect(transformed.id).toBe('test-id');
      expect(transformed.name).toBe('Test Client');
      expect(transformed.nit).toBe('123456789');
      expect(transformed.address).toBe('Test Address');
      expect(transformed.city).toBe('Test City');
      expect(transformed.seller_id).toBe('seller-123');
      expect(transformed.active).toBe(true);
      expect(transformed.created_at).toBe('2024-01-01T00:00:00.000Z');
    });

    test('debe manejar valores NULL correctamente', () => {
      const sqliteRecord = {
        id: 'test-id',
        name: 'Test Client',
        // nit, address, city, seller_id no están definidos
        active: 0,
        created_at: null
      };

      const transformed = validator.transformSqliteRecord(sqliteRecord);
      
      expect(transformed.nit).toBeNull();
      expect(transformed.address).toBeNull();
      expect(transformed.city).toBeNull();
      expect(transformed.seller_id).toBeNull();
      expect(transformed.active).toBe(false);
      expect(transformed.created_at).toBeDefined();
    });
  });

  describe('✅ Comparación de registros', () => {
    test('debe detectar cuando los registros son iguales', () => {
      const transformed = {
        id: 'test-id',
        name: 'Test Client',
        nit: '123456789',
        city: 'Test City',
        seller_id: 'seller-123'
      };

      const pgRecord = {
        id: 'test-id',
        name: 'Test Client',
        nit: '123456789',
        city: 'Test City',
        seller_id: 'seller-123'
      };

      const errors = validator.compareRecords(transformed, pgRecord);
      expect(errors).toHaveLength(0);
    });

    test('debe detectar diferencias en los registros', () => {
      const transformed = {
        id: 'test-id',
        name: 'Test Client',
        nit: '123456789',
        city: 'Test City',
        seller_id: 'seller-123'
      };

      const pgRecord = {
        id: 'test-id',
        name: 'Different Name', // Diferente
        nit: '987654321', // Diferente
        city: 'Test City',
        seller_id: 'seller-123'
      };

      const errors = validator.compareRecords(transformed, pgRecord);
      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe('name');
      expect(errors[1].field).toBe('nit');
    });
  });

  describe('✅ Validación de tipos de datos', () => {
    test('debe validar tipos de datos correctamente', async () => {
      mockPostgresQuery.mockResolvedValue({
        rows: [
          { column_name: 'id', data_type: 'character varying' },
          { column_name: 'name', data_type: 'character varying' },
          { column_name: 'nit', data_type: 'character varying' },
          { column_name: 'address', data_type: 'text' },
          { column_name: 'city', data_type: 'character varying' },
          { column_name: 'seller_id', data_type: 'character varying' },
          { column_name: 'active', data_type: 'boolean' },
          { column_name: 'created_at', data_type: 'timestamp without time zone' },
          { column_name: 'updated_at', data_type: 'timestamp without time zone' }
        ]
      });

      const result = await validator.validateDataTypes();
      
      expect(result.passed).toBe(true);
      expect(result.details.typeMismatches).toHaveLength(0);
    });

    test('debe detectar tipos de datos incorrectos', async () => {
      mockPostgresQuery.mockResolvedValue({
        rows: [
          { column_name: 'id', data_type: 'character varying' },
          { column_name: 'name', data_type: 'character varying' },
          { column_name: 'nit', data_type: 'integer' }, // Incorrecto, debería ser character varying
          { column_name: 'active', data_type: 'integer' } // Incorrecto, debería ser boolean
        ]
      });

      const result = await validator.validateDataTypes();
      
      expect(result.passed).toBe(false);
      expect(result.details.typeMismatches).toHaveLength(2);
    });
  });

  describe('✅ Validación completa', () => {
    test('debe ejecutar todas las validaciones', async () => {
      // Configurar mocks para todas las validaciones
      mockSqliteDb.prepare.mockImplementation((sql) => {
        if (sql.includes('COUNT(*)')) {
          return { get: () => ({ count: 100 }) };
        }
        if (sql.includes('ORDER BY RANDOM()')) {
          return { all: () => [] };
        }
        return { get: () => ({}) };
      });
      
      mockPostgresQuery.mockImplementation(async (sql) => {
        if (sql.includes('COUNT(*)')) {
          return { rows: [{ count: '100' }] };
        }
        if (sql.includes('information_schema.columns')) {
          return { rows: [] };
        }
        if (sql.includes('seller_id IS NOT NULL')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      const results = await validator.validateAll();
      
      expect(results.passed).toBe(true);
      expect(results.summary).toBeDefined();
      expect(results.summary.totalValidations).toBe(4);
      expect(results.details).toHaveProperty('recordCounts');
      expect(results.details).toHaveProperty('dataIntegrity');
      expect(results.details).toHaveProperty('relationships');
      expect(results.details).toHaveProperty('dataTypes');
    });
  });
});