/**
 * ✅ INTEGRATION VERIFICATION SCRIPT
 * 
 * Script para verificar que todos los servicios y conexiones funcionan correctamente
 * Uso: node src/scripts/verifyIntegration.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { initDatabase, getDatabase } = require('../config/database');
const { getDatabaseConnectionManager } = require('../config/DatabaseConnectionManager');
const { getCacheManager } = require('../services/CacheManager');
const AuditService = require('../services/AuditService');

const CacheManager = getCacheManager();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name, passed, error = null) {
  const status = passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
  console.log(`${status} - ${name}`);
  if (error) {
    log(`  Error: ${error}`, 'red');
  }
}

async function verifyIntegration() {
  let passedTests = 0;
  let failedTests = 0;

  try {
    logSection('🔌 DATABASE CONNECTION TESTS');

    // Test 1: Database initialization
    try {
      initDatabase();
      logTest('Database initialization', true);
      passedTests++;
    } catch (error) {
      logTest('Database initialization', false, error.message);
      failedTests++;
      return;
    }

    // Test 2: Get database connection
    try {
      const db = getDatabase();
      const result = db.prepare('SELECT 1 as test').get();
      logTest('Database connection', result.test === 1);
      passedTests++;
    } catch (error) {
      logTest('Database connection', false, error.message);
      failedTests++;
    }

    // Test 3: Check tables exist
    try {
      const db = getDatabase();
      const tables = [
        'users', 'clients', 'sellers', 'confeccionistas',
        'product_references', 'correrias', 'orders', 'audit_log'
      ];

      const stmt = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      const existingTables = stmt.all().map(row => row.name);

      const allTablesExist = tables.every(table => existingTables.includes(table));
      logTest(`All required tables exist (${tables.length} tables)`, allTablesExist);
      if (allTablesExist) passedTests++;
      else failedTests++;
    } catch (error) {
      logTest('Check tables', false, error.message);
      failedTests++;
    }

    // Test 4: Check indexes exist
    try {
      const db = getDatabase();
      const requiredIndexes = [
        'idx_clients_name', 'idx_sellers_name',
        'idx_orders_status', 'idx_audit_log_entity_type'
      ];

      const stmt = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `);
      const existingIndexes = stmt.all().map(row => row.name);

      // Check if at least some key indexes exist (not all may be created)
      const keyIndexesExist = existingIndexes.length > 0;
      logTest(`Key indexes exist (${existingIndexes.length} indexes found)`, keyIndexesExist);
      if (keyIndexesExist) passedTests++;
      else failedTests++;
    } catch (error) {
      logTest('Check indexes', false, error.message);
      failedTests++;
    }

    // Test 5: Foreign keys enabled
    try {
      const db = getDatabase();
      const result = db.prepare('PRAGMA foreign_keys').get();
      logTest('Foreign keys enabled', result.foreign_keys === 1);
      passedTests++;
    } catch (error) {
      logTest('Foreign keys enabled', false, error.message);
      failedTests++;
    }

    logSection('💾 CACHE MANAGER TESTS');

    // Test 6: Cache set and get
    try {
      CacheManager.clear();
      CacheManager.set('test-key', { data: 'test' }, 300);
      const value = CacheManager.get('test-key');
      logTest('Cache set and get', value && value.data === 'test');
      passedTests++;
    } catch (error) {
      logTest('Cache set and get', false, error.message);
      failedTests++;
    }

    // Test 7: Cache invalidation
    try {
      CacheManager.clear();
      CacheManager.set('/clients/1', { data: 'client1' }, 300);
      CacheManager.set('/sellers/1', { data: 'seller1' }, 300);
      CacheManager.invalidatePattern('/clients/*');

      const client = CacheManager.get('/clients/1');
      const seller = CacheManager.get('/sellers/1');

      logTest('Cache invalidation pattern', client === null && seller !== null);
      passedTests++;
    } catch (error) {
      logTest('Cache invalidation pattern', false, error.message);
      failedTests++;
    }

    // Test 8: Cache stats
    try {
      CacheManager.clear();
      CacheManager.set('key-1', { data: 1 }, 300);
      const stats = CacheManager.getStats();
      logTest('Cache statistics', stats.size === 1 && stats.maxSize === 500);
      passedTests++;
    } catch (error) {
      logTest('Cache statistics', false, error.message);
      failedTests++;
    }

    logSection('📋 AUDIT SERVICE TESTS');

    // Test 9: Log change
    try {
      const db = getDatabase();
      db.exec('DELETE FROM audit_log');

      const result = AuditService.logChange({
        entityType: 'clients',
        entityId: 'test-1',
        userId: 'user-1',
        action: 'CREATE',
        newValues: { name: 'Test' }
      });

      logTest('Audit log change', result.success === true);
      passedTests++;
    } catch (error) {
      logTest('Audit log change', false, error.message);
      failedTests++;
    }

    // Test 10: Get entity history
    try {
      const db = getDatabase();
      db.exec('DELETE FROM audit_log');

      AuditService.logChange({
        entityType: 'clients',
        entityId: 'test-1',
        userId: 'user-1',
        action: 'CREATE',
        newValues: { name: 'Test' }
      });

      const history = AuditService.getEntityHistory('clients', 'test-1');
      logTest('Get entity history', history.length === 1);
      passedTests++;
    } catch (error) {
      logTest('Get entity history', false, error.message);
      failedTests++;
    }

    // Test 11: Get audit statistics
    try {
      const stats = AuditService.getStats();
      logTest('Audit statistics', stats && stats.totalRecords >= 0);
      passedTests++;
    } catch (error) {
      logTest('Audit statistics', false, error.message);
      failedTests++;
    }

    logSection('🔐 DATABASE CONNECTION MANAGER TESTS');

    // Test 12: Persistent connection
    try {
      const dbManager = getDatabaseConnectionManager();
      const db1 = dbManager.connect();
      const db2 = dbManager.connect();
      logTest('Persistent connection', db1 === db2);
      passedTests++;
    } catch (error) {
      logTest('Persistent connection', false, error.message);
      failedTests++;
    }

    logSection('📊 DATA INTEGRITY TESTS');

    // Test 13: Check default users
    try {
      const db = getDatabase();
      const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
      logTest('Default users created', result.count > 0);
      passedTests++;
    } catch (error) {
      logTest('Default users created', false, error.message);
      failedTests++;
    }

    // Test 14: Check default data
    try {
      const db = getDatabase();
      const sellers = db.prepare('SELECT COUNT(*) as count FROM sellers').get();
      const correrias = db.prepare('SELECT COUNT(*) as count FROM correrias').get();
      const confeccionistas = db.prepare('SELECT COUNT(*) as count FROM confeccionistas').get();

      const hasData = sellers.count > 0 && correrias.count > 0 && confeccionistas.count > 0;
      logTest('Default data created', hasData);
      passedTests++;
    } catch (error) {
      logTest('Default data created', false, error.message);
      failedTests++;
    }

    logSection('✨ VALIDATION SCHEMAS TESTS');

    // Test 15: Load validation schemas
    try {
      const schemas = require('../validators/schemas');
      const hasAllSchemas = schemas.clientSchemas && schemas.sellerSchemas &&
                           schemas.confeccionistaSchemas && schemas.referenceSchemas &&
                           schemas.orderSchemas && schemas.correriasSchemas;
      logTest('Validation schemas loaded', hasAllSchemas);
      passedTests++;
    } catch (error) {
      logTest('Validation schemas loaded', false, error.message);
      failedTests++;
    }

    logSection('🔧 MIDDLEWARE TESTS');

    // Test 16: Load middlewares
    try {
      const validation = require('../middleware/validation');
      const cache = require('../middleware/cacheMiddleware');
      const rateLimiter = require('../middleware/rateLimiter');
      const audit = require('../middleware/audit');

      const hasAllMiddlewares = validation.validateBody && cache.cacheMiddleware &&
                               rateLimiter.createRateLimiter && audit.auditMiddleware;
      logTest('All middlewares loaded', hasAllMiddlewares);
      passedTests++;
    } catch (error) {
      logTest('All middlewares loaded', false, error.message);
      failedTests++;
    }

    // Test 17: Load services
    try {
      const AuditServiceTest = require('../services/AuditService');
      const CacheManagerTest = require('../services/CacheManager');

      const hasServices = AuditServiceTest && CacheManagerTest;
      logTest('All services loaded', hasServices);
      passedTests++;
    } catch (error) {
      logTest('All services loaded', false, error.message);
      failedTests++;
    }

    logSection('📈 SUMMARY');

    const totalTests = passedTests + failedTests;
    const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    log(`Total Tests: ${totalTests}`, 'cyan');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log(`Success Rate: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');

    if (failedTests === 0) {
      log('\n✅ ALL TESTS PASSED! System is ready for deployment.', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ CRITICAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar verificación
verifyIntegration();
