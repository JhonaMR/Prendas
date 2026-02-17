/**
 * 🧪 INTEGRATION TESTS
 * 
 * Tests completos para verificar que todos los servicios y conexiones funcionan correctamente
 */

const { getDatabase, initDatabase } = require('../config/database');
const CacheManager = require('../services/CacheManager');
const AuditService = require('../services/AuditService');
const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');

describe('🔌 Database Connection Tests', () => {
  let db;

  beforeAll(() => {
    try {
      initDatabase();
      db = getDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  });

  test('✅ Database connection should be established', () => {
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
  });

  test('✅ Database should have all required tables', () => {
    const tables = [
      'users',
      'clients',
      'sellers',
      'confeccionistas',
      'product_references',
      'correrias',
      'orders',
      'order_items',
      'receptions',
      'reception_items',
      'dispatches',
      'dispatch_items',
      'delivery_dates',
      'audit_log'
    ];

    const stmt = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    const existingTables = stmt.all().map(row => row.name);

    tables.forEach(table => {
      expect(existingTables).toContain(table);
    });
  });

  test('✅ Database should have all required indexes', () => {
    const indexes = [
      'idx_clients_name',
      'idx_clients_email',
      'idx_sellers_name',
      'idx_orders_status',
      'idx_delivery_dates_delivery_date',
      'idx_audit_log_entity_type'
    ];

    const stmt = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
    `);
    const existingIndexes = stmt.all().map(row => row.name);

    indexes.forEach(index => {
      expect(existingIndexes).toContain(index);
    });
  });

  test('✅ Database should have default users', () => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get();
    expect(result.count).toBeGreaterThan(0);
  });

  test('✅ Foreign keys should be enabled', () => {
    const stmt = db.prepare('PRAGMA foreign_keys');
    const result = stmt.get();
    expect(result.foreign_keys).toBe(1);
  });
});

describe('💾 CacheManager Tests', () => {
  beforeEach(() => {
    CacheManager.clear();
  });

  test('✅ CacheManager should set and get values', () => {
    CacheManager.set('test-key', { data: 'test' }, 300);
    const value = CacheManager.get('test-key');
    expect(value).toEqual({ data: 'test' });
  });

  test('✅ CacheManager should return null for expired values', (done) => {
    CacheManager.set('test-key', { data: 'test' }, 1);
    setTimeout(() => {
      const value = CacheManager.get('test-key');
      expect(value).toBeNull();
      done();
    }, 1100);
  });

  test('✅ CacheManager should delete values', () => {
    CacheManager.set('test-key', { data: 'test' }, 300);
    CacheManager.delete('test-key');
    const value = CacheManager.get('test-key');
    expect(value).toBeNull();
  });

  test('✅ CacheManager should invalidate patterns', () => {
    CacheManager.set('/clients/1', { data: 'client1' }, 300);
    CacheManager.set('/clients/2', { data: 'client2' }, 300);
    CacheManager.set('/sellers/1', { data: 'seller1' }, 300);

    CacheManager.invalidatePattern('/clients/*');

    expect(CacheManager.get('/clients/1')).toBeNull();
    expect(CacheManager.get('/clients/2')).toBeNull();
    expect(CacheManager.get('/sellers/1')).toEqual({ data: 'seller1' });
  });

  test('✅ CacheManager should enforce LRU eviction', () => {
    // Llenar el caché hasta el límite
    for (let i = 0; i < 510; i++) {
      CacheManager.set(`key-${i}`, { data: i }, 300);
    }

    // El primer item debe haber sido evicted
    expect(CacheManager.get('key-0')).toBeNull();
    // El último item debe estar presente
    expect(CacheManager.get('key-509')).toEqual({ data: 509 });
  });

  test('✅ CacheManager should return stats', () => {
    CacheManager.set('key-1', { data: 1 }, 300);
    CacheManager.set('key-2', { data: 2 }, 300);

    const stats = CacheManager.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(500);
    expect(stats.hitRate).toBeGreaterThanOrEqual(0);
  });
});

describe('📋 AuditService Tests', () => {
  let db;

  beforeAll(() => {
    initDatabase();
    db = getDatabase();
  });

  beforeEach(() => {
    // Limpiar audit_log
    db.exec('DELETE FROM audit_log');
  });

  test('✅ AuditService should log changes', () => {
    const result = AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Client' },
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent'
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  test('✅ AuditService should retrieve entity history', () => {
    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Client' }
    });

    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'UPDATE',
      oldValues: { name: 'Test Client' },
      newValues: { name: 'Updated Client' }
    });

    const history = AuditService.getEntityHistory('clients', 'test-1');
    expect(history.length).toBe(2);
    expect(history[0].action).toBe('UPDATE');
    expect(history[1].action).toBe('CREATE');
  });

  test('✅ AuditService should retrieve user actions', () => {
    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Client' }
    });

    AuditService.logChange({
      entityType: 'sellers',
      entityId: 'seller-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Seller' }
    });

    const actions = AuditService.getUserActions('user-1');
    expect(actions.length).toBe(2);
  });

  test('✅ AuditService should retrieve actions by type', () => {
    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Client' }
    });

    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-2',
      userId: 'user-1',
      action: 'DELETE',
      oldValues: { name: 'Test Client 2' }
    });

    const createActions = AuditService.getActionsByType('CREATE');
    const deleteActions = AuditService.getActionsByType('DELETE');

    expect(createActions.length).toBeGreaterThan(0);
    expect(deleteActions.length).toBeGreaterThan(0);
  });

  test('✅ AuditService should calculate changes correctly', () => {
    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'UPDATE',
      oldValues: { name: 'Old Name', city: 'Old City' },
      newValues: { name: 'New Name', city: 'Old City' }
    });

    const history = AuditService.getEntityHistory('clients', 'test-1');
    expect(history[0].changes).toBeDefined();
    expect(history[0].changes.name).toBeDefined();
    expect(history[0].changes.name.from).toBe('Old Name');
    expect(history[0].changes.name.to).toBe('New Name');
    expect(history[0].changes.city).toBeUndefined();
  });

  test('✅ AuditService should return statistics', () => {
    AuditService.logChange({
      entityType: 'clients',
      entityId: 'test-1',
      userId: 'user-1',
      action: 'CREATE',
      newValues: { name: 'Test Client' }
    });

    const stats = AuditService.getStats();
    expect(stats).toBeDefined();
    expect(stats.totalRecords).toBeGreaterThan(0);
    expect(stats.byAction).toBeDefined();
    expect(stats.byEntity).toBeDefined();
  });
});

describe('🔐 DatabaseConnectionManager Tests', () => {
  test('✅ DatabaseConnectionManager should provide persistent connection', () => {
    const dbManager = getDatabaseConnectionManager();
    const db1 = dbManager.connect();
    const db2 = dbManager.connect();

    expect(db1).toBe(db2);
  });

  test('✅ DatabaseConnectionManager should disconnect', () => {
    const dbManager = getDatabaseConnectionManager();
    dbManager.connect();
    expect(() => dbManager.disconnect()).not.toThrow();
  });
});

describe('📊 Data Integrity Tests', () => {
  let db;

  beforeAll(() => {
    initDatabase();
    db = getDatabase();
  });

  test('✅ Should enforce foreign key constraints', () => {
    // Intentar insertar una orden con un cliente que no existe
    const stmt = db.prepare(`
      INSERT INTO orders (id, client_id, correria_id, status, active)
      VALUES (?, ?, ?, ?, ?)
    `);

    expect(() => {
      stmt.run('order-1', 'non-existent-client', 'correria-1', 'pending', 1);
    }).toThrow();
  });

  test('✅ Should validate data types', () => {
    const stmt = db.prepare(`
      INSERT INTO clients (id, name, nit, address, city, seller, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Insertar cliente válido
    expect(() => {
      stmt.run('test-client', 'Test Client', '123456', 'Address', 'City', 'Seller', 1);
    }).not.toThrow();
  });

  test('✅ Should enforce unique constraints', () => {
    const stmt = db.prepare(`
      INSERT INTO clients (id, name, nit, address, city, seller, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run('unique-test', 'Test', '123', 'Addr', 'City', 'Seller', 1);

    // Intentar insertar con el mismo ID
    expect(() => {
      stmt.run('unique-test', 'Test 2', '456', 'Addr2', 'City2', 'Seller2', 1);
    }).toThrow();
  });
});

describe('⚡ Performance Tests', () => {
  let db;

  beforeAll(() => {
    initDatabase();
    db = getDatabase();
  });

  test('✅ Index queries should be fast', () => {
    const startTime = Date.now();

    // Query con índice
    const stmt = db.prepare('SELECT * FROM clients WHERE name = ?');
    stmt.get('Test Client');

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Debe ser muy rápido (menos de 100ms)
    expect(duration).toBeLessThan(100);
  });

  test('✅ CacheManager should improve performance', () => {
    const data = { id: 1, name: 'Test', value: 'data' };

    // Primera lectura (sin caché)
    const start1 = Date.now();
    CacheManager.set('perf-test', data, 300);
    const end1 = Date.now();

    // Segunda lectura (con caché)
    const start2 = Date.now();
    CacheManager.get('perf-test');
    const end2 = Date.now();

    const time1 = end1 - start1;
    const time2 = end2 - start2;

    // La lectura del caché debe ser más rápida
    expect(time2).toBeLessThanOrEqual(time1);
  });
});

module.exports = {
  describe,
  test,
  beforeAll,
  beforeEach
};
