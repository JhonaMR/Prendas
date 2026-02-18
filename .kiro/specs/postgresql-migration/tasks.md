# PostgreSQL Migration - Tasks

## Phase 1: Setup & Configuration

### 1.1 Install PostgreSQL and Dependencies
- [ ] Install PostgreSQL locally (or use Docker)
- [ ] Install pg npm package: `npm install pg`
- [ ] Create PostgreSQL database: `createdb inventory`
- [ ] Create test database: `createdb inventory_test`
- [ ] Verify PostgreSQL connection works
- [ ] Document PostgreSQL installation steps

### 1.2 Create Environment Configuration
- [ ] Add .env variables for PostgreSQL connection
- [ ] Create .env.example with PostgreSQL config
- [ ] Add DB_POOL_MIN, DB_POOL_MAX configuration
- [ ] Add DB_IDLE_TIMEOUT, DB_CONNECTION_TIMEOUT
- [ ] Document all environment variables
- [ ] Verify environment variables are read correctly

### 1.3 Create Database Connection Module
- [ ] Create new `backend/src/config/postgres.js`
- [ ] Implement connection pool initialization
- [ ] Implement query() helper function
- [ ] Implement transaction() helper function
- [ ] Implement closePool() function
- [ ] Add connection health check on startup
- [ ] Add error event handlers for pool
- [ ] Add logging for pool events

---

## Phase 2: Schema Migration

### 2.1 Create PostgreSQL Schema
- [ ] Create users table with proper schema
- [ ] Create product_references table
- [ ] Create clients table
- [ ] Create confeccionistas table
- [ ] Create sellers table
- [ ] Create correrias table
- [ ] Create receptions table (master)
- [ ] Create reception_items table (detail)
- [ ] Create return_receptions table (master)
- [ ] Create return_reception_items table (detail)
- [ ] Create dispatches table (master)
- [ ] Create dispatch_items table (detail)
- [ ] Create orders table (master)
- [ ] Create order_items table (detail)
- [ ] Create production_tracking table
- [ ] Create delivery_dates table
- [ ] Create audit_log table

### 2.2 Create Indexes
- [ ] Create index on users.login_code
- [ ] Create index on users.active
- [ ] Create index on product_references.active
- [ ] Create index on clients.seller_id
- [ ] Create index on receptions.batch_code
- [ ] Create index on receptions.confeccionista
- [ ] Create index on receptions.created_at
- [ ] Create index on dispatches.client_id
- [ ] Create index on dispatches.correria_id
- [ ] Create index on orders.client_id
- [ ] Create index on orders.created_at
- [ ] Create indexes on audit_log (entity_type, entity_id, user_id, action, created_at)
- [ ] Verify all indexes are created

### 2.3 Create Foreign Key Constraints
- [ ] Add FK: clients.seller_id → sellers.id
- [ ] Add FK: receptions.confeccionista → confeccionistas.id
- [ ] Add FK: reception_items.reception_id → receptions.id
- [ ] Add FK: reception_items.reference → product_references.id
- [ ] Add FK: return_receptions.client_id → clients.id
- [ ] Add FK: return_reception_items.return_reception_id → return_receptions.id
- [ ] Add FK: dispatches.client_id → clients.id
- [ ] Add FK: dispatches.correria_id → correrias.id
- [ ] Add FK: dispatch_items.dispatch_id → dispatches.id
- [ ] Add FK: orders.client_id → clients.id
- [ ] Add FK: orders.seller_id → sellers.id
- [ ] Add FK: orders.correria_id → correrias.id
- [ ] Add FK: production_tracking.ref_id → product_references.id
- [ ] Add FK: delivery_dates.confeccionista_id → confeccionistas.id
- [ ] Add FK: delivery_dates.reference_id → product_references.id
- [ ] Verify all foreign keys are created

---

## Phase 3: Data Migration

### 3.1 Create Migration Script
- [ ] Create `backend/src/scripts/migrateToPostgres.js`
- [ ] Read all data from SQLite database
- [ ] Transform data types (timestamps, etc.)
- [ ] Insert data into PostgreSQL in correct order
- [ ] Handle foreign key relationships
- [ ] Add error handling and logging
- [ ] Add rollback capability
- [ ] Test migration script with test database

### 3.2 Migrate Data
- [ ] Run migration script on test database
- [ ] Verify row counts match
- [ ] Verify data integrity
- [ ] Check for any migration errors
- [ ] Verify foreign key relationships
- [ ] Compare sample data between SQLite and PostgreSQL
- [ ] Document any data transformations

### 3.3 Verify Migration
- [ ] Count records in each table (SQLite vs PostgreSQL)
- [ ] Verify no NULL values in NOT NULL columns
- [ ] Verify all foreign key relationships are valid
- [ ] Verify CHECK constraints are satisfied
- [ ] Verify unique constraints are satisfied
- [ ] Run sample queries and compare results
- [ ] Create migration verification report

---

## Phase 4: Service Layer Refactoring

### 4.1 Refactor Database Configuration
- [ ] Update `backend/src/config/database.js` to use PostgreSQL
- [ ] Replace better-sqlite3 with pg
- [ ] Implement connection pool
- [ ] Implement query helper
- [ ] Implement transaction helper
- [ ] Add error handling
- [ ] Update exports
- [ ] Test configuration

### 4.2 Refactor AuditService
- [ ] Convert logChange() to async
- [ ] Convert getEntityHistory() to async
- [ ] Convert getUserActions() to async
- [ ] Convert getActionsByType() to async
- [ ] Convert getStats() to async
- [ ] Update all queries to use parameterized statements
- [ ] Add error handling
- [ ] Test all methods

### 4.3 Refactor CacheManager
- [ ] No changes needed (in-memory cache)
- [ ] Verify it works with async database calls
- [ ] Test cache invalidation

### 4.4 Refactor PaginationService
- [ ] No changes needed (utility functions)
- [ ] Verify it works with async database calls

### 4.5 Refactor ReceptionService
- [ ] Convert all methods to async
- [ ] Update all queries to use parameterized statements
- [ ] Implement transaction for createReception
- [ ] Add error handling
- [ ] Test all methods

### 4.6 Refactor DispatchService
- [ ] Convert all methods to async
- [ ] Update all queries to use parameterized statements
- [ ] Implement transaction for createDispatch
- [ ] Add error handling
- [ ] Test all methods

### 4.7 Refactor ReturnService
- [ ] Convert all methods to async
- [ ] Update all queries to use parameterized statements
- [ ] Implement transaction for createReturnReception
- [ ] Add error handling
- [ ] Test all methods

### 4.8 Refactor BulkClientImportService
- [ ] Convert all methods to async
- [ ] Update all queries to use parameterized statements
- [ ] Implement transaction for bulk import
- [ ] Add error handling
- [ ] Test bulk import

---

## Phase 5: Controller Layer Refactoring

### 5.1 Refactor Auth Controller
- [ ] Convert login() to async
- [ ] Convert register() to async
- [ ] Convert changePin() to async
- [ ] Convert listUsers() to async
- [ ] Convert updateUser() to async
- [ ] Convert deleteUser() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.2 Refactor References Controller
- [ ] Convert list() to async
- [ ] Convert read() to async
- [ ] Convert create() to async
- [ ] Convert update() to async
- [ ] Convert delete() to async
- [ ] Convert getCorreriaReferences() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.3 Refactor Clients Controller
- [ ] Convert list() to async
- [ ] Convert read() to async
- [ ] Convert create() to async
- [ ] Convert update() to async
- [ ] Convert delete() to async
- [ ] Convert bulkImport() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.4 Refactor Confeccionistas Controller
- [ ] Convert list() to async
- [ ] Convert read() to async
- [ ] Convert create() to async
- [ ] Convert update() to async
- [ ] Convert delete() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.5 Refactor Sellers Controller
- [ ] Convert list() to async
- [ ] Convert read() to async
- [ ] Convert create() to async
- [ ] Convert update() to async
- [ ] Convert delete() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.6 Refactor Correrias Controller
- [ ] Convert list() to async
- [ ] Convert read() to async
- [ ] Convert create() to async
- [ ] Convert update() to async
- [ ] Convert delete() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.7 Refactor Movements Controller
- [ ] Convert getReceptions() to async
- [ ] Convert createReception() to async
- [ ] Convert getReturnReceptions() to async
- [ ] Convert createReturnReception() to async
- [ ] Convert getDispatches() to async
- [ ] Convert createDispatch() to async
- [ ] Convert updateDispatch() to async
- [ ] Convert deleteDispatch() to async
- [ ] Convert getOrders() to async
- [ ] Convert createOrder() to async
- [ ] Convert getProductionTracking() to async
- [ ] Convert updateProductionTracking() to async
- [ ] Convert saveProductionBatch() to async
- [ ] Update error handling
- [ ] Test all endpoints

### 5.8 Refactor Delivery Dates Controller
- [ ] Convert getDeliveryDates() to async
- [ ] Convert saveDeliveryDatesBatchHandler() to async
- [ ] Convert deleteDeliveryDateHandler() to async
- [ ] Update error handling
- [ ] Test all endpoints

---

## Phase 6: Testing

### 6.1 Unit Tests - Services
- [ ] Test AuditService with PostgreSQL
- [ ] Test ReceptionService with PostgreSQL
- [ ] Test DispatchService with PostgreSQL
- [ ] Test ReturnService with PostgreSQL
- [ ] Test BulkClientImportService with PostgreSQL
- [ ] Test error handling in all services
- [ ] Verify all tests pass

### 6.2 Unit Tests - Controllers
- [ ] Test Auth Controller endpoints
- [ ] Test References Controller endpoints
- [ ] Test Clients Controller endpoints
- [ ] Test Confeccionistas Controller endpoints
- [ ] Test Sellers Controller endpoints
- [ ] Test Correrias Controller endpoints
- [ ] Test Movements Controller endpoints
- [ ] Test Delivery Dates Controller endpoints
- [ ] Verify all tests pass

### 6.3 Integration Tests
- [ ] Test complete reception workflow
- [ ] Test complete dispatch workflow
- [ ] Test complete order workflow
- [ ] Test transaction rollback on error
- [ ] Test concurrent operations
- [ ] Test bulk import
- [ ] Verify all tests pass

### 6.4 Transaction Tests
- [ ] Test reception creation with items (rollback on error)
- [ ] Test dispatch creation with items (rollback on error)
- [ ] Test order creation with items (rollback on error)
- [ ] Test return reception creation (rollback on error)
- [ ] Verify transaction isolation
- [ ] Verify rollback works correctly

### 6.5 Connection Pool Tests
- [ ] Test connection acquisition
- [ ] Test connection release
- [ ] Test pool exhaustion handling
- [ ] Test idle connection cleanup
- [ ] Test connection timeout
- [ ] Verify pool metrics

### 6.6 Migration Tests
- [ ] Test migration script with test database
- [ ] Verify data integrity after migration
- [ ] Test rollback procedure
- [ ] Verify no data loss
- [ ] Compare query results before/after

---

## Phase 7: Documentation & Deployment

### 7.1 Documentation
- [ ] Document PostgreSQL setup instructions
- [ ] Document environment variables
- [ ] Document connection pool configuration
- [ ] Document transaction patterns
- [ ] Document error handling
- [ ] Document migration procedure
- [ ] Document rollback procedure
- [ ] Create troubleshooting guide

### 7.2 Deployment Preparation
- [ ] Create PostgreSQL database in staging
- [ ] Run migration script in staging
- [ ] Verify all tests pass in staging
- [ ] Performance test in staging
- [ ] Create backup of SQLite database
- [ ] Document pre-deployment checklist
- [ ] Document deployment steps
- [ ] Document post-deployment verification

### 7.3 Deployment
- [ ] Create PostgreSQL database in production
- [ ] Create backup of SQLite database
- [ ] Stop application
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Update environment variables
- [ ] Start application
- [ ] Monitor logs for errors
- [ ] Verify all endpoints work
- [ ] Run smoke tests

### 7.4 Post-Deployment
- [ ] Monitor database performance
- [ ] Monitor error rates
- [ ] Monitor connection pool usage
- [ ] Verify audit log is working
- [ ] Verify transactions are working
- [ ] Collect performance metrics
- [ ] Document any issues
- [ ] Archive SQLite database

---

## Phase 8: Optimization & Cleanup

### 8.1 Performance Optimization
- [ ] Analyze slow queries with EXPLAIN
- [ ] Add missing indexes if needed
- [ ] Optimize connection pool settings
- [ ] Benchmark query performance
- [ ] Document performance metrics

### 8.2 Code Cleanup
- [ ] Remove SQLite-specific code
- [ ] Remove migration scripts (archive)
- [ ] Update comments and documentation
- [ ] Remove debug logging
- [ ] Code review all changes

### 8.3 Monitoring Setup
- [ ] Set up database performance monitoring
- [ ] Set up error rate monitoring
- [ ] Set up connection pool monitoring
- [ ] Set up slow query logging
- [ ] Create dashboards

---

## Summary

**Total Tasks**: 100+  
**Estimated Time**: 10-15 hours  
**Phases**: 8  
**Risk Level**: Medium (well-structured migration)  
**Rollback Capability**: Yes (documented procedure)

## Success Criteria

- [ ] All data successfully migrated
- [ ] All tests pass with PostgreSQL
- [ ] Application handles 10+ concurrent users
- [ ] No SQL injection vulnerabilities
- [ ] Transactions working for critical operations
- [ ] Performance meets requirements
- [ ] Zero data loss
- [ ] Deployment procedure documented
- [ ] Rollback procedure tested
- [ ] Team trained on new system
