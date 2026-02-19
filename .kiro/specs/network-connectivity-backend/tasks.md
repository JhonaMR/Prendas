# Implementation Plan: Network Connectivity Backend Configuration

## Overview

This implementation plan breaks down the network connectivity feature into discrete coding tasks. The solution adds intelligent network detection to the backend, allowing it to automatically use the correct database host based on the execution environment. Tasks are organized to build incrementally, with testing integrated throughout to catch issues early.

## Tasks

- [x] 1. Create Network Environment Detector Module
  - Create `backend/src/config/networkDetector.js`
  - Implement `detectNetworkInterfaces()` function to detect all available network interfaces using `os.networkInterfaces()`
  - Implement `extractIPv4Addresses()` function to extract IPv4 addresses from interfaces
  - Implement `filterLoopbackAddresses()` function to filter out 127.0.0.1
  - Implement `selectPrimaryIP()` function to prioritize Ethernet over WiFi
  - Implement `getDatabaseHost()` function to apply NODE_ENV-specific rules
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 1.1 Write property tests for network detection
    - **Property 1: Network Interface Detection Completeness**
    - **Property 2: Loopback Address Filtering**
    - **Property 3: Fallback to Localhost on Empty Non-Loopback**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Create Configuration Manager Module
  - Create `backend/src/config/configurationManager.js`
  - Implement `initializeConfiguration()` function to detect network and load environment variables
  - Implement `getConfiguration()` function to return current configuration
  - Implement `constructConnectionString()` function to build pg.Pool connection parameters
  - Implement `validateConfiguration()` function to check for required fields
  - Implement `logConfiguration()` function to log details (excluding credentials)
  - Implement `reloadConfiguration()` function to support configuration reload
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.1 Write property tests for configuration manager
    - **Property 8: Connection String Contains All Credentials**
    - **Property 9: Connection String Uses Correct Port**
    - **Property 10: Configuration Validation Detects Missing Fields**
    - **Property 11: Logging Excludes Sensitive Credentials**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

- [x] 3. Enhance Environment Detection for NODE_ENV Modes
  - Update `backend/src/config/configurationManager.js` to implement environment-specific rules
  - For development mode: use localhost, allow connection failures
  - For production mode: use detected IP, enforce strict validation
  - For staging mode: use detected IP with relaxed validation
  - For unknown NODE_ENV: default to development and log warning
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.1 Write property tests for NODE_ENV modes
    - **Property 4: Development Mode Uses Localhost**
    - **Property 5: Production Mode Uses Detected IP**
    - **Property 6: Staging Mode Uses Detected IP**
    - **Property 7: Unknown NODE_ENV Defaults to Development**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 4. Implement Database Connection Manager with Fallback
  - Update `backend/src/config/postgres.js` to add fallback mechanism
  - Implement `initPoolWithFallback()` function to attempt primary then fallback connection
  - Implement `connectWithRetry()` function with exponential backoff (1s, 2s, 4s)
  - Implement `attemptFallbackConnection()` function to connect to localhost
  - Implement `getConnectionStatus()` function to return current connection state
  - Implement `attemptReconnection()` function for automatic reconnection
  - Add logging for all connection attempts and failures
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.1 Write property tests for connection manager
    - **Property 12: Fallback Connection Attempted on Primary Failure**
    - **Property 13: Fallback Connection Success Allows Continuation**
    - **Property 14: Exponential Backoff Retry Timing**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

- [x] 5. Implement Health Check Endpoint
  - Create `backend/src/routes/health.js`
  - Implement `GET /health` endpoint
  - Return 200 OK with detailed status when database is connected
  - Return 503 Service Unavailable when database is not connected
  - Include connection status, detected IP, environment info, and pool statistics
  - Measure database response time
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5, 5.6_

  - [ ]* 5.1 Write property tests for health endpoint
    - **Property 15: Test Connection on Startup**
    - **Property 16: Service Unavailable When Database Not Ready**
    - **Property 18: Health Endpoint Returns Accurate Status**
    - **Property 19: Health Endpoint Includes Required Fields**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.5, 5.6**

- [x] 6. Enhance Logging System
  - Update `backend/src/controllers/shared/logger.js` to add network detection logging
  - Add INFO level logs for detected network environment (available IPs, selected host)
  - Add INFO level logs for database connection establishment (host, port, database)
  - Add WARN level logs for fallback connection usage
  - Add ERROR level logs for connection failures with stack traces
  - Ensure all logs exclude sensitive credentials (passwords, secrets)
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.1 Write property tests for logging
    - **Property 11: Logging Excludes Sensitive Credentials**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 7. Integrate Configuration Manager into Application Startup
  - Update `backend/src/index.js` (or main entry point) to use new configuration manager
  - Call `initializeConfiguration()` before initializing database
  - Call `initPoolWithFallback()` instead of `initPool()`
  - Add health check endpoint to Express app
  - Ensure database is ready before accepting requests
  - Log startup configuration details
  - _Requirements: 1.1, 2.1, 4.1, 4.2, 5.1, 5.2_

  - [ ]* 7.1 Write integration tests for startup flow
    - Test application starts with detected IP
    - Test configuration is loaded correctly
    - Test database connection is established
    - Test health endpoint returns healthy status
    - **Validates: Requirements 1.1, 2.1, 4.1, 4.2, 5.1, 5.2**

- [x] 8. Implement Automatic Reconnection Logic
  - Update `backend/src/config/postgres.js` to add automatic reconnection
  - Implement background task to check database connectivity periodically
  - On disconnection: attempt automatic reconnection
  - On successful reconnection: log and resume normal operation
  - Ensure requests return 503 while database is unavailable
  - _Requirements: 4.5, 4.6_

  - [ ]* 8.1 Write property tests for automatic reconnection
    - **Property 17: Automatic Reconnection on Database Unavailability**
    - **Validates: Requirements 4.5, 4.6**

- [x] 9. Add Configuration Reload Support
  - Implement `reloadConfiguration()` function in configuration manager
  - Allow configuration to be reloaded without full application restart
  - Update database connection parameters on reload
  - Log configuration changes with timestamp and reason
  - _Requirements: 6.6_

  - [ ]* 9.1 Write property tests for configuration reload
    - **Property 20: Configuration Reload Without Restart**
    - **Validates: Requirements 6.6**

- [x] 10. Implement Remote Client Access Validation
  - Update database connection logic to ensure remote clients use detected IP
  - Add logging to verify which IP is being used for each connection
  - Ensure connection pool properly isolates concurrent requests
  - Ensure connections are cleaned up on client disconnect
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 10.1 Write property tests for remote client access
    - **Property 21: Remote Client Uses Detected IP**
    - **Property 22: Remote Record Addition Succeeds**
    - **Property 23: Connection Pool Isolation**
    - **Property 24: Connection Cleanup on Disconnect**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [x] 11. Checkpoint - Ensure all unit and property tests pass
  - Run all unit tests: `npm test -- backend/src/config`
  - Run all property tests: `npm test -- backend/src/config --testNamePattern="property"`
  - Verify test coverage is >90% for new modules
  - Ensure all tests pass before proceeding
  - _Requirements: All_

- [x] 12. Update Backend .env Configuration
  - Verify `backend/.env` has all required variables
  - Ensure DB_HOST is set to localhost (will be overridden by detection)
  - Ensure NODE_ENV is set appropriately (development for local, production for network)
  - Document the new network detection behavior in comments
  - _Requirements: 1.5, 1.6, 6.1, 6.2, 6.3_

- [x] 13. Create Integration Test for Multi-PC Network Access
  - Create test that simulates remote client access
  - Verify backend uses detected IP for database connections
  - Verify record addition (recepciones) succeeds from remote client
  - Verify health endpoint returns correct status
  - Verify connection pool handles concurrent requests
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 13.1 Write integration tests
    - Test remote client can add records
    - Test health endpoint from remote client
    - Test concurrent requests from multiple clients
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [x] 14. Checkpoint - Ensure all integration tests pass
  - Run integration tests: `npm test -- backend/src/config --testNamePattern="integration"`
  - Verify remote client access works correctly
  - Verify database operations succeed
  - Verify health endpoint works
  - Ensure all tests pass before proceeding
  - _Requirements: All_

- [x] 15. Update Documentation
  - Update `documentacion/ACCESO_RED_LOCAL.md` with new network detection behavior
  - Document how the system automatically detects and uses the correct IP
  - Document fallback mechanism and error handling
  - Document health check endpoint usage
  - Document troubleshooting steps for network connectivity issues
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 16. Final Checkpoint - Verify Complete Solution
  - Verify all code is committed
  - Verify all tests pass (unit, property, integration)
  - Verify application starts correctly with network detection
  - Verify remote client can access application and add records
  - Verify health endpoint returns correct status
  - Verify logs show detected IP and connection details
  - Verify fallback mechanism works when primary connection fails
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows with remote clients
- All new modules should have >90% test coverage
- Sensitive credentials (passwords, secrets) must be excluded from all logs

