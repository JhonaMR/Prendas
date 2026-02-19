# Design Document: Network Connectivity Backend Configuration

## Overview

This design implements a dynamic network configuration system that automatically detects the correct database host based on the execution environment. The system detects available network interfaces, prioritizes non-loopback IPv4 addresses, and configures the database connection accordingly. It includes fallback mechanisms, comprehensive logging, and health checks to ensure reliable connectivity across local network access scenarios.

The solution maintains backward compatibility with existing code while adding intelligent environment detection that works seamlessly in development, staging, and production environments.

## Architecture

### High-Level Flow

```
Application Start
    ↓
Network Environment Detection
    ├─ Detect all network interfaces
    ├─ Extract IPv4 addresses
    └─ Prioritize non-loopback addresses
    ↓
Configuration System
    ├─ Read detected IP
    ├─ Apply environment-specific rules
    └─ Construct connection string
    ↓
Database Connection
    ├─ Attempt primary connection
    ├─ On failure: attempt fallback (localhost)
    └─ On success: mark database as ready
    ↓
Health Check & Logging
    ├─ Validate connectivity
    ├─ Log configuration details
    └─ Expose health endpoint
    ↓
Application Ready
    └─ Accept requests
```

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Express Application                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Network Environment Detector                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Detect network interfaces (os.networkInterfaces)  │   │
│  │ • Extract IPv4 addresses                            │   │
│  │ • Filter loopback addresses                         │   │
│  │ • Select primary IP based on priority               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Configuration Manager                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Read environment variables                         │   │
│  │ • Apply NODE_ENV-specific rules                      │   │
│  │ • Construct connection string                        │   │
│  │ • Validate configuration                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Database Connection Manager                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Attempt primary connection                         │   │
│  │ • Implement retry logic with exponential backoff     │   │
│  │ • Fallback to localhost on failure                   │   │
│  │ • Manage connection pool                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Health Check & Monitoring                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Validate database connectivity                     │   │
│  │ • Expose /health endpoint                           │   │
│  │ • Log configuration and connection details          │   │
│  │ • Monitor connection pool status                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Network Environment Detector

**Purpose**: Detect available network interfaces and select the appropriate IP address.

**Module**: `backend/src/config/networkDetector.js`

**Key Functions**:

```javascript
/**
 * Detect all available network interfaces
 * @returns {Object} Object with interface names as keys and address arrays as values
 */
function detectNetworkInterfaces()

/**
 * Extract IPv4 addresses from network interfaces
 * @param {Object} interfaces - Network interfaces object from os.networkInterfaces()
 * @returns {Array<string>} Array of IPv4 addresses
 */
function extractIPv4Addresses(interfaces)

/**
 * Filter out loopback addresses
 * @param {Array<string>} addresses - Array of IPv4 addresses
 * @returns {Array<string>} Array of non-loopback IPv4 addresses
 */
function filterLoopbackAddresses(addresses)

/**
 * Select the primary IP address based on priority
 * Priority: Ethernet > WiFi > Other
 * @param {Object} interfaces - Network interfaces object
 * @returns {string|null} Selected IP address or null if only loopback available
 */
function selectPrimaryIP(interfaces)

/**
 * Get the appropriate database host based on environment
 * @param {string} nodeEnv - NODE_ENV value (development, production, staging)
 * @returns {string} Database host (detected IP or localhost)
 */
function getDatabaseHost(nodeEnv)
```

**Behavior**:
- Detects all network interfaces using `os.networkInterfaces()`
- Extracts IPv4 addresses from each interface
- Filters out loopback addresses (127.0.0.1)
- Prioritizes Ethernet interfaces over WiFi
- Returns the first non-loopback IPv4 address found
- Falls back to localhost if no non-loopback addresses exist
- Respects NODE_ENV setting (development uses localhost by default)

### 2. Configuration Manager

**Purpose**: Manage dynamic configuration based on detected environment and environment variables.

**Module**: `backend/src/config/configurationManager.js`

**Key Functions**:

```javascript
/**
 * Initialize configuration with network detection
 * @returns {Promise<Object>} Configuration object with detected host
 */
async function initializeConfiguration()

/**
 * Get the current configuration
 * @returns {Object} Configuration object
 */
function getConfiguration()

/**
 * Construct database connection string
 * @param {Object} config - Configuration object
 * @returns {Object} Connection parameters for pg.Pool
 */
function constructConnectionString(config)

/**
 * Validate configuration completeness
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result {valid: boolean, errors: Array<string>}
 */
function validateConfiguration(config)

/**
 * Log configuration details (excluding sensitive data)
 * @param {Object} config - Configuration object
 */
function logConfiguration(config)

/**
 * Reload configuration without restarting
 * @returns {Promise<Object>} Updated configuration
 */
async function reloadConfiguration()
```

**Behavior**:
- Calls network detector to get the appropriate database host
- Reads environment variables using existing `environment.js`
- Applies NODE_ENV-specific rules:
  - **development**: Uses localhost by default, allows connection failures
  - **production**: Uses detected IP, enforces strict validation
  - **staging**: Uses detected IP with relaxed validation
- Constructs connection parameters for pg.Pool
- Validates all required configuration
- Logs configuration details (excluding credentials)
- Supports configuration reload

### 3. Database Connection Manager (Enhanced)

**Purpose**: Manage database connections with fallback and retry logic.

**Module**: `backend/src/config/postgres.js` (enhanced)

**Key Functions**:

```javascript
/**
 * Initialize connection pool with fallback mechanism
 * @returns {Promise<Pool>} PostgreSQL connection pool
 */
async function initPoolWithFallback()

/**
 * Attempt connection with retry logic
 * @param {Object} config - Connection configuration
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Pool>} Connection pool
 */
async function connectWithRetry(config, maxRetries = 3)

/**
 * Attempt fallback connection to localhost
 * @returns {Promise<Pool>} Connection pool
 */
async function attemptFallbackConnection()

/**
 * Validate database connectivity
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
async function validateConnectivity()

/**
 * Get connection status
 * @returns {Object} Status object {connected: boolean, host: string, error: string|null}
 */
function getConnectionStatus()

/**
 * Attempt automatic reconnection
 * @returns {Promise<boolean>} true if reconnected, false otherwise
 */
async function attemptReconnection()
```

**Behavior**:
- Attempts to connect using the detected/configured host
- Implements exponential backoff retry logic (max 3 attempts)
- On primary connection failure, attempts fallback to localhost
- Logs all connection attempts and failures
- Validates connectivity with test query
- Provides connection status information
- Supports automatic reconnection during operation

### 4. Health Check Endpoint

**Purpose**: Provide real-time status of database connectivity and configuration.

**Module**: `backend/src/routes/health.js` (new)

**Endpoint**: `GET /health`

**Response**:
```javascript
{
  status: "healthy" | "degraded" | "unhealthy",
  timestamp: "2024-01-15T10:30:00Z",
  database: {
    connected: boolean,
    host: string,
    port: number,
    database: string,
    responseTime: number // milliseconds
  },
  environment: {
    nodeEnv: string,
    detectedIP: string,
    fallbackUsed: boolean
  },
  pool: {
    totalConnections: number,
    idleConnections: number,
    waitingRequests: number
  }
}
```

**Behavior**:
- Returns 200 OK if database is connected
- Returns 503 Service Unavailable if database is not connected
- Includes detailed status information
- Measures database response time
- Indicates if fallback connection is being used

### 5. Logging System (Enhanced)

**Purpose**: Provide comprehensive logging for debugging network and connectivity issues.

**Module**: `backend/src/controllers/shared/logger.js` (enhanced)

**Log Levels**:
- **INFO**: Configuration loaded, connection established, environment detected
- **DEBUG**: Network interface details, connection attempts, pool statistics
- **WARN**: Fallback connection used, configuration reload, connection pool warnings
- **ERROR**: Connection failures, configuration errors, critical issues

**Key Log Messages**:
```
[INFO] 🌐 Network Environment Detection:
  - Detected IP: 10.10.0.34
  - Available interfaces: Ethernet, WiFi
  - Selected host: 10.10.0.34

[INFO] 🔧 Configuration Loaded:
  - Database host: 10.10.0.34
  - Database port: 5433
  - Database name: inventory
  - Environment: production
  - Connection pool: min=5, max=20

[INFO] ✅ Database Connection Established:
  - Host: 10.10.0.34:5433
  - Response time: 45ms
  - Pool initialized

[WARN] ⚠️ Fallback Connection Used:
  - Primary host failed: 10.10.0.34:5433
  - Attempting fallback: localhost:5433
  - Reason: Connection timeout

[ERROR] ❌ Critical Connection Failure:
  - Both primary and fallback connections failed
  - Error: ECONNREFUSED
  - Application will exit
```

## Data Models

### Configuration Object

```javascript
{
  // Server
  PORT: number,
  NODE_ENV: "development" | "production" | "staging",
  HOST: string,

  // Database Connection
  DB_HOST: string,           // Detected or configured host
  DB_PORT: number,
  DB_USER: string,
  DB_PASSWORD: string,
  DB_NAME: string,

  // Connection Pool
  DB_POOL_MIN: number,
  DB_POOL_MAX: number,
  DB_IDLE_TIMEOUT: number,
  DB_CONNECTION_TIMEOUT: number,
  DB_SSL: boolean,

  // Network Detection
  DETECTED_IP: string,       // Detected network IP
  FALLBACK_USED: boolean,    // Whether fallback connection is active
  NETWORK_INTERFACES: Array<{
    name: string,
    addresses: Array<string>
  }>,

  // JWT
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string,

  // CORS
  CORS_ORIGIN: string
}
```

### Connection Status Object

```javascript
{
  connected: boolean,
  host: string,
  port: number,
  database: string,
  error: string | null,
  fallbackUsed: boolean,
  lastAttempt: Date,
  retryCount: number,
  poolStats: {
    totalConnections: number,
    idleConnections: number,
    waitingRequests: number
  }
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Network Interface Detection Completeness

*For any* system with available network interfaces, the network detector should extract all IPv4 addresses from all detected interfaces without omitting any valid addresses.

**Validates: Requirements 1.1, 1.2**

### Property 2: Loopback Address Filtering

*For any* list of IPv4 addresses containing both loopback (127.0.0.1) and non-loopback addresses, the filter should remove all loopback addresses while preserving all non-loopback addresses.

**Validates: Requirements 1.3**

### Property 3: Fallback to Localhost on Empty Non-Loopback

*For any* network state where only loopback addresses are available, the system should fall back to localhost as the database host.

**Validates: Requirements 1.4**

### Property 4: Development Mode Uses Localhost

*For any* configuration with NODE_ENV set to "development", the database host should be localhost regardless of detected network IPs.

**Validates: Requirements 1.6, 6.1**

### Property 5: Production Mode Uses Detected IP

*For any* configuration with NODE_ENV set to "production" and available non-loopback IPs, the database host should be the detected network IP, not localhost.

**Validates: Requirements 1.5, 6.2**

### Property 6: Staging Mode Uses Detected IP

*For any* configuration with NODE_ENV set to "staging" and available non-loopback IPs, the database host should be the detected network IP.

**Validates: Requirements 6.3**

### Property 7: Unknown NODE_ENV Defaults to Development

*For any* unknown NODE_ENV value, the system should default to development mode and log a warning.

**Validates: Requirements 6.4**

### Property 8: Connection String Contains All Credentials

*For any* valid configuration object with user, password, and database name, the constructed connection string should include all three credentials.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 9: Connection String Uses Correct Port

*For any* configuration with a specified DB_PORT, the constructed connection string should use that port (default 5433 if not specified).

**Validates: Requirements 2.3**

### Property 10: Configuration Validation Detects Missing Fields

*For any* configuration object missing required fields (DB_USER, DB_PASSWORD, DB_NAME), validation should return an error list containing all missing fields.

**Validates: Requirements 2.5, 2.6**

### Property 11: Logging Excludes Sensitive Credentials

*For any* log message containing connection details, the message should include host, port, and database name but exclude passwords and secrets.

**Validates: Requirements 2.5, 5.1, 5.2**

### Property 12: Fallback Connection Attempted on Primary Failure

*For any* primary connection failure, the system should automatically attempt a fallback connection to localhost and log the fallback action with the failure reason.

**Validates: Requirements 3.1, 3.2**

### Property 13: Fallback Connection Success Allows Continuation

*For any* scenario where primary connection fails but fallback to localhost succeeds, the application should continue operation and log the fallback status.

**Validates: Requirements 3.3**

### Property 14: Exponential Backoff Retry Timing

*For any* connection retry sequence with exponential backoff, the delay between consecutive retries should increase exponentially (e.g., 1s, 2s, 4s) up to the maximum of 3 attempts.

**Validates: Requirements 3.5**

### Property 15: Test Connection on Startup

*For any* application startup, the system should attempt a test database connection and log success or failure before accepting requests.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 16: Service Unavailable When Database Not Ready

*For any* incoming request when the database is not ready, the backend should return a 503 Service Unavailable response with a descriptive error message.

**Validates: Requirements 4.4**

### Property 17: Automatic Reconnection on Database Unavailability

*For any* scenario where the database becomes unavailable during operation, the system should attempt automatic reconnection without requiring an application restart.

**Validates: Requirements 4.5, 4.6**

### Property 18: Health Endpoint Returns Accurate Status

*For any* call to the health check endpoint, the response should accurately reflect the current database connection status (healthy if connected, unhealthy if disconnected).

**Validates: Requirements 5.5, 5.6**

### Property 19: Health Endpoint Includes Required Fields

*For any* health check response, the response should include connection status, detected IP, database availability, and pool statistics.

**Validates: Requirements 5.6**

### Property 20: Configuration Reload Without Restart

*For any* configuration reload operation, the system should apply new configuration without requiring a full application restart.

**Validates: Requirements 6.6**

### Property 21: Remote Client Uses Detected IP

*For any* remote client request to the backend API, the database connection should use the detected network IP (not localhost) for the operation.

**Validates: Requirements 7.1, 7.4**

### Property 22: Remote Record Addition Succeeds

*For any* remote client request to add a record (e.g., recepciones), the backend should successfully connect to the database using the correct IP and return a 200 OK response.

**Validates: Requirements 7.2, 7.3**

### Property 23: Connection Pool Isolation

*For any* concurrent client requests, each request should obtain its own connection from the pool without interference from other requests.

**Validates: Requirements 7.5**

### Property 24: Connection Cleanup on Disconnect

*For any* client disconnection, the backend should properly release the database connection back to the pool for reuse.

**Validates: Requirements 7.6**

## Error Handling

### Connection Failures

**Scenario**: Primary database connection fails

**Handling**:
1. Log the failure with reason (timeout, refused, etc.)
2. Attempt fallback connection to localhost
3. If fallback succeeds, log warning and continue with degraded mode
4. If fallback fails, log critical error and exit with code 1

**User Impact**: 
- If fallback succeeds: Application continues, requests may be slower
- If fallback fails: Application exits, user sees "Service Unavailable"

### Configuration Errors

**Scenario**: Missing or invalid environment variables

**Handling**:
1. Log validation errors with specific details
2. In development: Use defaults and continue
3. In production: Exit with code 1 and clear error message

**User Impact**:
- Development: Application starts with warnings
- Production: Application fails to start with clear error

### Network Detection Failures

**Scenario**: Unable to detect network interfaces

**Handling**:
1. Log the detection failure
2. Fall back to localhost
3. Continue with localhost as database host

**User Impact**: Application works locally but may not be accessible from network

### Health Check Failures

**Scenario**: Health check endpoint called when database is unavailable

**Handling**:
1. Return 503 Service Unavailable
2. Include error details in response
3. Attempt automatic reconnection in background

**User Impact**: Client receives clear error indicating service is temporarily unavailable

## Testing Strategy

### Unit Testing

Unit tests validate specific examples, edge cases, and error conditions:

1. **Network Detection Tests**
   - Test detection with various network interface configurations
   - Test IPv4 extraction from mixed interface types
   - Test loopback filtering
   - Test priority-based IP selection
   - Test fallback to localhost when no non-loopback IPs exist

2. **Configuration Manager Tests**
   - Test configuration initialization with detected IP
   - Test environment-specific rule application
   - Test connection string construction
   - Test configuration validation with missing fields
   - Test configuration reload

3. **Database Connection Tests**
   - Test successful connection with detected IP
   - Test connection failure and fallback to localhost
   - Test retry logic with exponential backoff
   - Test connection pool initialization
   - Test connection status reporting

4. **Health Check Tests**
   - Test health endpoint with connected database
   - Test health endpoint with disconnected database
   - Test response time measurement
   - Test pool statistics reporting

5. **Logging Tests**
   - Test log message format and content
   - Test credential masking in logs
   - Test log levels (INFO, DEBUG, WARN, ERROR)

### Property-Based Testing

Property-based tests validate universal properties across many generated inputs:

1. **Network Detection Property Tests**
   - Generate random network interface configurations
   - Verify consistent IP selection across invocations
   - Verify non-loopback filtering works for all generated addresses

2. **Configuration Property Tests**
   - Generate random configuration objects
   - Verify round-trip consistency (construct → parse → construct)
   - Verify validation detects all invalid configurations

3. **Connection Property Tests**
   - Generate random connection scenarios
   - Verify fallback activation on primary failure
   - Verify exponential backoff timing

4. **Health Check Property Tests**
   - Generate random connection states
   - Verify health status accuracy
   - Verify response includes all required fields

### Test Configuration

- **Minimum iterations**: 100 per property test
- **Test framework**: Jest (existing in project)
- **Property testing library**: fast-check
- **Coverage target**: >90% for new modules

### Integration Testing

Integration tests verify end-to-end flows:

1. **Application Startup Flow**
   - Start application with detected IP
   - Verify configuration is loaded
   - Verify database connection is established
   - Verify health endpoint returns healthy status

2. **Remote Client Access Flow**
   - Connect from remote client
   - Send request to add record
   - Verify database operation succeeds
   - Verify response is returned to client

3. **Fallback Activation Flow**
   - Simulate primary connection failure
   - Verify fallback connection is attempted
   - Verify application continues with fallback
   - Verify warning is logged

4. **Configuration Reload Flow**
   - Change environment variables
   - Call configuration reload
   - Verify new configuration is applied
   - Verify application continues without restart

