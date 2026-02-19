# Requirements Document: Network Connectivity Backend Configuration

## Introduction

The backend application currently fails to connect to PostgreSQL when accessed from remote PCs on the local network. The issue stems from hardcoded "localhost" database connection strings that don't resolve correctly from remote machines. This feature implements a dynamic network configuration system that detects and uses the correct IP address based on the execution environment, enabling seamless multi-PC access to the application.

## Glossary

- **Backend_Server**: The Node.js/Express application running on the primary machine
- **Database_Host**: The network address used to connect to PostgreSQL (currently hardcoded as "localhost")
- **Network_Environment**: The context in which the application runs (local development, network access, etc.)
- **Configuration_System**: The mechanism that determines and applies the correct database connection parameters
- **Remote_Client**: A PC on the local network attempting to access the application
- **Connection_String**: The complete database connection parameters (host, port, user, password, database)
- **Environment_Detection**: The process of identifying the current network environment and available IP addresses
- **Fallback_Mechanism**: A safety system that ensures database connectivity even if primary detection fails

## Requirements

### Requirement 1: Detect Network Environment and Available IP Addresses

**User Story:** As a system administrator, I want the backend to automatically detect the network environment and available IP addresses, so that it can determine the correct database connection host without manual configuration.

#### Acceptance Criteria

1. WHEN the backend starts, THE Backend_Server SHALL detect all available network interfaces on the machine
2. WHEN network interfaces are detected, THE Backend_Server SHALL extract IPv4 addresses from each interface
3. WHEN multiple IPv4 addresses are available, THE Backend_Server SHALL prioritize non-loopback addresses (excluding 127.0.0.1)
4. WHEN no non-loopback addresses are found, THE Backend_Server SHALL fall back to localhost for local development
5. WHEN the environment variable NODE_ENV is set to "production", THE Backend_Server SHALL use the detected network IP instead of localhost
6. WHEN the environment variable NODE_ENV is set to "development", THE Backend_Server SHALL use localhost as the default database host

### Requirement 2: Configure Dynamic Database Connection Parameters

**User Story:** As a developer, I want the database connection parameters to be dynamically configured based on the detected environment, so that the application works correctly whether accessed locally or from the network.

#### Acceptance Criteria

1. WHEN the Backend_Server initializes, THE Configuration_System SHALL read the detected IP address
2. WHEN a detected IP is available, THE Configuration_System SHALL construct a Connection_String using the detected IP and configured port
3. WHEN constructing the Connection_String, THE Configuration_System SHALL use the DB_PORT environment variable (default: 5433)
4. WHEN the Connection_String is constructed, THE Configuration_System SHALL include all required credentials from environment variables (DB_USER, DB_PASSWORD, DB_NAME)
5. WHEN the Connection_String is ready, THE Backend_Server SHALL log the connection parameters (excluding sensitive credentials) for debugging purposes
6. WHEN environment variables are missing, THE Configuration_System SHALL use sensible defaults and log warnings

### Requirement 3: Implement Fallback Mechanism for Connection Failures

**User Story:** As a system operator, I want the backend to have a fallback mechanism that ensures database connectivity even if the primary detection fails, so that the application remains resilient.

#### Acceptance Criteria

1. WHEN the initial database connection attempt fails, THE Backend_Server SHALL attempt to reconnect using localhost as the fallback host
2. WHEN a fallback connection is attempted, THE Backend_Server SHALL log the fallback action with the reason for failure
3. WHEN the fallback connection succeeds, THE Backend_Server SHALL continue operation and notify the operator
4. WHEN both primary and fallback connections fail, THE Backend_Server SHALL log a critical error and exit gracefully with a clear error message
5. WHEN connection failures occur, THE Backend_Server SHALL implement exponential backoff retry logic (max 3 attempts with increasing delays)

### Requirement 4: Validate Database Connectivity

**User Story:** As a quality assurance engineer, I want the backend to validate database connectivity before accepting requests, so that users receive clear error messages instead of cryptic 500 errors.

#### Acceptance Criteria

1. WHEN the backend starts, THE Backend_Server SHALL attempt to establish a test connection to the database
2. WHEN the test connection succeeds, THE Backend_Server SHALL log a success message and mark the database as ready
3. WHEN the test connection fails, THE Backend_Server SHALL log the failure reason and attempt the fallback mechanism
4. WHEN a request arrives and the database is not ready, THE Backend_Server SHALL return a 503 Service Unavailable response with a descriptive error message
5. WHEN the database becomes unavailable during operation, THE Backend_Server SHALL attempt to reconnect automatically
6. WHEN the database reconnects successfully, THE Backend_Server SHALL resume normal operation without requiring a restart

### Requirement 5: Provide Configuration Logging and Debugging Information

**User Story:** As a developer, I want comprehensive logging of the configuration process, so that I can quickly diagnose network and connectivity issues.

#### Acceptance Criteria

1. WHEN the backend starts, THE Backend_Server SHALL log the detected network environment (available IPs, selected host)
2. WHEN the database connection is established, THE Backend_Server SHALL log the connection details (host, port, database name - excluding credentials)
3. WHEN configuration changes occur, THE Backend_Server SHALL log the change with timestamp and reason
4. WHEN errors occur during configuration or connection, THE Backend_Server SHALL log detailed error information including stack traces
5. WHEN the backend is running, THE Backend_Server SHALL provide a health check endpoint that returns the current database connection status
6. WHEN the health check endpoint is called, THE Backend_Server SHALL return connection status, detected IP, and database availability

### Requirement 6: Support Multiple Environment Configurations

**User Story:** As a DevOps engineer, I want the configuration system to support different environments (development, staging, production), so that the same codebase can be deployed to different contexts.

#### Acceptance Criteria

1. WHEN NODE_ENV is "development", THE Configuration_System SHALL use localhost and allow connection failures without exiting
2. WHEN NODE_ENV is "production", THE Configuration_System SHALL use the detected network IP and enforce strict connection validation
3. WHEN NODE_ENV is "staging", THE Configuration_System SHALL use the detected network IP with relaxed connection validation
4. WHEN an unknown NODE_ENV value is provided, THE Configuration_System SHALL default to "development" mode and log a warning
5. WHEN environment-specific configuration is applied, THE Backend_Server SHALL log the active environment mode
6. WHEN switching environments, THE Configuration_System SHALL allow configuration reload without requiring a full restart

### Requirement 7: Enable Remote Client Access with Correct Connection Resolution

**User Story:** As an end user, I want to access the application from another PC on the network without encountering database connection errors, so that the application works seamlessly across the local network.

#### Acceptance Criteria

1. WHEN a remote client connects to the backend API, THE Backend_Server SHALL use the detected network IP for database connections
2. WHEN the remote client sends a request to add a record (e.g., recepciones), THE Backend_Server SHALL successfully connect to the database using the correct IP
3. WHEN the database operation completes, THE Backend_Server SHALL return a 200 OK response with the result
4. WHEN the remote client receives the response, THE Backend_Server SHALL have used the network IP (not localhost) for the database connection
5. WHEN multiple remote clients connect simultaneously, THE Backend_Server SHALL maintain separate connection pools for each client request
6. WHEN a remote client disconnects, THE Backend_Server SHALL properly clean up database connections

