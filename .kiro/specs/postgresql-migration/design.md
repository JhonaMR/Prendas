# PostgreSQL Migration - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Express Application                      │
├─────────────────────────────────────────────────────────────┤
│  Controllers → Services → Database Layer                     │
├─────────────────────────────────────────────────────────────┤
│                    Connection Pool (pg)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pool: 10-20 connections                              │   │
│  │ Idle timeout: 30s                                    │   │
│  │ Connection timeout: 5s                               │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 15+ tables with proper schema                        │   │
│  │ Foreign key constraints                              │   │
│  │ Indexes on frequently queried columns                │   │
│  │ Audit log with performance indexes                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Layer Architecture

### Current (SQLite)
```
backend/src/config/database.js
├── initDatabase() - Creates tables
├── getDatabase() - Returns db instance
└── generateId() - Generates unique IDs

Services use synchronous queries:
db.prepare('SELECT * FROM users').all()
```

### New (PostgreSQL)
```
backend/src/config/database.js
├── initPool() - Creates connection pool
├── getPool() - Returns pool instance
├── query() - Executes parameterized queries
├── transaction() - Manages transactions
└── closePool() - Closes all connections

Services use async/await:
const result = await query('SELECT * FROM users')
```

## Connection Pool Design

```javascript
// Configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inventory',
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 5000, // 5 seconds
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});
```

## Query Execution Pattern

### Before (SQLite - Synchronous)
```javascript
const getAllUsers = () => {
  const result = db.prepare('SELECT * FROM users WHERE active = 1').all();
  return result;
};
```

### After (PostgreSQL - Asynchronous)
```javascript
const getAllUsers = async () => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE active = $1',
      [1]
    );
    return result.rows;
  } catch (error) {
    logger.error('Error fetching users', error);
    throw error;
  }
};
```

## Transaction Pattern

```javascript
const createReceptionWithItems = async (receptionData, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert reception
    const receptionResult = await client.query(
      `INSERT INTO receptions (id, batch_code, confeccionista, charge_type, charge_units, received_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [receptionData.id, receptionData.batchCode, receptionData.confeccionista, 
       receptionData.chargeType, receptionData.chargeUnits, receptionData.receivedBy, new Date()]
    );
    
    // Insert items
    for (const item of items) {
      await client.query(
        `INSERT INTO reception_items (reception_id, reference, size, quantity)
         VALUES ($1, $2, $3, $4)`,
        [receptionData.id, item.reference, item.size, item.quantity]
      );
    }
    
    await client.query('COMMIT');
    return receptionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction failed', error);
    throw error;
  } finally {
    client.release();
  }
};
```

## Schema Mapping

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  login_code VARCHAR(3) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'observer', 'general')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_login_code ON users(login_code);
CREATE INDEX idx_users_active ON users(active);
```

### Product References Table
```sql
CREATE TABLE product_references (
  id VARCHAR(255) PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK(price > 0),
  designer VARCHAR(255) NOT NULL,
  cloth1 VARCHAR(255),
  avg_cloth1 DECIMAL(5, 2),
  cloth2 VARCHAR(255),
  avg_cloth2 DECIMAL(5, 2),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_references_active ON product_references(active);
CREATE INDEX idx_product_references_description ON product_references(description);
```

### Receptions Table (Master)
```sql
CREATE TABLE receptions (
  id VARCHAR(255) PRIMARY KEY,
  batch_code VARCHAR(255) NOT NULL,
  confeccionista VARCHAR(255) NOT NULL,
  has_seconds INTEGER,
  charge_type VARCHAR(50),
  charge_units INTEGER NOT NULL DEFAULT 0,
  received_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (confeccionista) REFERENCES confeccionistas(id)
);

CREATE INDEX idx_receptions_batch_code ON receptions(batch_code);
CREATE INDEX idx_receptions_confeccionista ON receptions(confeccionista);
CREATE INDEX idx_receptions_created_at ON receptions(created_at);
```

### Reception Items Table (Detail)
```sql
CREATE TABLE reception_items (
  id SERIAL PRIMARY KEY,
  reception_id VARCHAR(255) NOT NULL,
  reference VARCHAR(255) NOT NULL,
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  FOREIGN KEY (reception_id) REFERENCES receptions(id) ON DELETE CASCADE,
  FOREIGN KEY (reference) REFERENCES product_references(id)
);

CREATE INDEX idx_reception_items_reception_id ON reception_items(reception_id);
CREATE INDEX idx_reception_items_reference ON reception_items(reference);
```

### Audit Log Table
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(255) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  action VARCHAR(50) NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

## Data Migration Strategy

### Phase 1: Preparation
1. Create PostgreSQL database
2. Create all tables with schema
3. Verify schema integrity

### Phase 2: Data Transfer
1. Read all data from SQLite
2. Transform data if needed (timestamps, types)
3. Insert into PostgreSQL in correct order (respect foreign keys)
4. Verify row counts match

### Phase 3: Verification
1. Check all foreign key relationships
2. Verify data integrity
3. Compare checksums
4. Test queries

### Phase 4: Cleanup
1. Archive SQLite database
2. Update environment variables
3. Restart application

## Error Handling Strategy

### Connection Errors
```javascript
try {
  const result = await pool.query(sql, params);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    logger.error('Database connection refused');
    // Retry logic
  } else if (error.code === 'ETIMEDOUT') {
    logger.error('Database connection timeout');
    // Retry logic
  }
}
```

### Constraint Violations
```javascript
catch (error) {
  if (error.code === '23505') { // Unique violation
    throw new ValidationError('Duplicate entry');
  } else if (error.code === '23503') { // Foreign key violation
    throw new ValidationError('Referenced record not found');
  } else if (error.code === '23514') { // Check violation
    throw new ValidationError('Invalid value');
  }
}
```

## Testing Strategy

### Unit Tests
- Test each service method with PostgreSQL
- Mock connection pool for isolated tests
- Test error handling

### Integration Tests
- Test complete workflows (reception → dispatch)
- Test transaction rollback
- Test concurrent operations

### Migration Tests
- Verify data integrity after migration
- Test rollback procedure
- Performance benchmarks

## Deployment Strategy

### Pre-Deployment
1. Create PostgreSQL database in production
2. Create backup of SQLite database
3. Run migration script in staging
4. Verify all tests pass

### Deployment
1. Stop application
2. Run migration script
3. Verify data integrity
4. Update environment variables
5. Start application
6. Monitor logs for errors

### Rollback
1. Stop application
2. Restore SQLite database
3. Update environment variables
4. Start application

## Performance Considerations

### Indexes
- Index on frequently queried columns (active, created_at, entity_id)
- Composite indexes for common filter combinations
- Partial indexes for active records only

### Connection Pool
- Min: 5 connections
- Max: 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 5 seconds

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Batch operations when possible
- Use prepared statements

## Monitoring

### Metrics to Track
- Connection pool usage
- Query execution time
- Error rates
- Transaction rollback rates
- Database size

### Logging
- All database errors logged
- Slow queries logged (> 1 second)
- Transaction start/commit/rollback logged
- Connection pool events logged

## Rollback Plan

### If Migration Fails
1. Stop application
2. Restore SQLite database from backup
3. Update environment variables to use SQLite
4. Restart application
5. Investigate failure
6. Fix issues
7. Retry migration

### If Issues Found Post-Migration
1. Verify data integrity
2. Check for missing records
3. Verify foreign key relationships
4. Check audit log for anomalies
5. If critical issues: execute rollback

## Environment Variables

```bash
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=inventory

# Connection Pool
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# SSL (production only)
DB_SSL=false
```

## Correctness Properties

### Property 1: Data Integrity
**Validates: Requirements 3.1, 3.2**

For any data migrated from SQLite to PostgreSQL:
- Row count must match exactly
- All foreign key relationships must be valid
- No NULL values in NOT NULL columns
- All CHECK constraints must be satisfied

### Property 2: Transaction Atomicity
**Validates: Requirements 5.1, 5.2**

For any transaction:
- Either all operations succeed or all rollback
- No partial updates are visible
- Concurrent transactions don't interfere

### Property 3: Query Equivalence
**Validates: Requirements 4.1, 4.2**

For any query:
- Results from PostgreSQL match SQLite results
- Query execution time is acceptable (< 100ms)
- No data loss or corruption

### Property 4: Connection Pool Reliability
**Validates: Requirements 6.1, 6.2**

For connection pool:
- Connections are properly released after use
- Pool doesn't exhaust under normal load
- Idle connections are cleaned up
- New connections can be acquired when needed

### Property 5: Error Handling
**Validates: Requirements 8.1, 8.2**

For any database error:
- Error is caught and logged
- User receives appropriate error message
- Application continues running
- No data corruption occurs
