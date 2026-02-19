/**
 * 🏥 HEALTH CHECK ENDPOINT
 * 
 * Provides real-time status of database connectivity and configuration.
 * Returns detailed information about connection status, detected IP, environment,
 * and connection pool statistics.
 * 
 * Endpoint: GET /health
 * Response: 200 OK (healthy) or 503 Service Unavailable (unhealthy)
 */

const express = require('express');
const router = express.Router();
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');
const logger = require('../controllers/shared/logger');

/**
 * GET /health
 * 
 * Returns the current health status of the application and database.
 * 
 * Response (200 OK - Healthy):
 * {
 *   status: "healthy",
 *   timestamp: "2024-01-15T10:30:00Z",
 *   database: {
 *     connected: true,
 *     host: "10.10.0.34",
 *     port: 5433,
 *     database: "inventory",
 *     responseTime: 45
 *   },
 *   environment: {
 *     nodeEnv: "production",
 *     detectedIP: "10.10.0.34",
 *     fallbackUsed: false
 *   },
 *   pool: {
 *     totalConnections: 5,
 *     idleConnections: 4,
 *     waitingRequests: 0
 *   }
 * }
 * 
 * Response (503 Service Unavailable - Unhealthy):
 * {
 *   status: "unhealthy",
 *   timestamp: "2024-01-15T10:30:00Z",
 *   database: {
 *     connected: false,
 *     host: null,
 *     port: null,
 *     database: null,
 *     error: "Connection refused"
 *   },
 *   environment: {
 *     nodeEnv: "production",
 *     detectedIP: "10.10.0.34",
 *     fallbackUsed: false
 *   },
 *   pool: null
 * }
 */
router.get('/health', async (req, res) => {
  try {
    logger.debug('🏥 Health check endpoint called');

    const timestamp = new Date().toISOString();

    // Get connection status
    const connectionStatus = postgres.getConnectionStatus();

    // Get configuration
    const config = configurationManager.getConfiguration();

    // Measure database response time
    let responseTime = null;
    let isHealthy = false;

    if (connectionStatus.connected) {
      try {
        const startTime = Date.now();
        const result = await postgres.query('SELECT NOW()');
        responseTime = Date.now() - startTime;
        isHealthy = result.rowCount === 1;
        logger.debug(`✅ Health check query executed in ${responseTime}ms`);
      } catch (error) {
        logger.warn(`⚠️ Health check query failed: ${error.message}`);
        isHealthy = false;
        connectionStatus.connected = false;
        connectionStatus.error = error.message;
      }
    }

    // Build response
    const healthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      database: {
        connected: isHealthy,
        host: connectionStatus.host,
        port: connectionStatus.port,
        database: connectionStatus.database,
        responseTime: responseTime
      },
      environment: {
        nodeEnv: config.NODE_ENV,
        detectedIP: config.DETECTED_IP,
        fallbackUsed: connectionStatus.fallbackUsed
      },
      pool: isHealthy ? {
        totalConnections: connectionStatus.poolStats.totalConnections || 0,
        idleConnections: connectionStatus.poolStats.idleConnections || 0,
        waitingRequests: connectionStatus.poolStats.waitingRequests || 0
      } : null
    };

    // Add error information if unhealthy
    if (!isHealthy && connectionStatus.error) {
      healthResponse.database.error = connectionStatus.error;
    }

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;
    logger.info(`🏥 Health check response: ${statusCode} - ${healthResponse.status}`);

    res.status(statusCode).json(healthResponse);
  } catch (error) {
    logger.error('❌ Health check endpoint error', error);

    const timestamp = new Date().toISOString();
    const errorResponse = {
      status: 'unhealthy',
      timestamp,
      database: {
        connected: false,
        host: null,
        port: null,
        database: null,
        error: error.message
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        detectedIP: null,
        fallbackUsed: false
      },
      pool: null
    };

    res.status(503).json(errorResponse);
  }
});

module.exports = router;
