/**
 * 🔄 CONFIGURATION RELOAD ENDPOINT
 * 
 * Provides endpoint to reload configuration without restarting the application.
 * Allows updating database connection parameters and other configuration on-the-fly.
 * 
 * Endpoint: POST /config/reload
 * Access: Admin only
 */

const express = require('express');
const router = express.Router();
const configurationManager = require('../config/configurationManager');
const postgres = require('../config/postgres');
const logger = require('../controllers/shared/logger');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * POST /config/reload
 * 
 * Reload configuration without restarting the application.
 * Updates database connection parameters if they have changed.
 * 
 * Request body (optional):
 * {
 *   reason: "string describing why configuration is being reloaded"
 * }
 * 
 * Response (200 OK):
 * {
 *   success: true,
 *   message: "Configuration reloaded successfully",
 *   timestamp: "2024-01-15T10:30:00Z",
 *   configuration: {
 *     nodeEnv: "production",
 *     dbHost: "10.10.0.34",
 *     dbPort: 5433,
 *     detectedIP: "10.10.0.34"
 *   }
 * }
 */
router.post('/reload', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const timestamp = new Date().toISOString();

    logger.info(`🔄 Configuration reload requested${reason ? ` - Reason: ${reason}` : ''}`);

    // Reload configuration
    const newConfig = await configurationManager.reloadConfiguration();

    // Log configuration change with timestamp and reason
    logger.info('📝 Configuration Change Log:', {
      timestamp,
      reason: reason || 'Manual reload',
      nodeEnv: newConfig.NODE_ENV,
      dbHost: newConfig.DB_HOST,
      dbPort: newConfig.DB_PORT,
      detectedIP: newConfig.DETECTED_IP,
      fallbackUsed: newConfig.FALLBACK_USED
    });

    // Check if database connection parameters changed
    const oldStatus = postgres.getConnectionStatus();
    const configChanged = 
      oldStatus.host !== newConfig.DB_HOST || 
      oldStatus.port !== newConfig.DB_PORT;

    if (configChanged) {
      logger.info('🔄 Database connection parameters changed. Attempting reconnection...');
      
      // Attempt reconnection with new parameters
      const reconnected = await postgres.attemptReconnection();
      
      if (reconnected) {
        logger.info('✅ Reconnection successful with new configuration');
      } else {
        logger.warn('⚠️ Reconnection failed. Using previous connection.');
      }
    }

    // Build response
    const response = {
      success: true,
      message: 'Configuration reloaded successfully',
      timestamp,
      configuration: {
        nodeEnv: newConfig.NODE_ENV,
        dbHost: newConfig.DB_HOST,
        dbPort: newConfig.DB_PORT,
        detectedIP: newConfig.DETECTED_IP,
        fallbackUsed: newConfig.FALLBACK_USED,
        connectionParametersChanged: configChanged
      }
    };

    logger.info('✅ Configuration reload completed successfully');
    res.status(200).json(response);
  } catch (error) {
    logger.error('❌ Configuration reload failed', error);

    const timestamp = new Date().toISOString();
    const errorResponse = {
      success: false,
      message: 'Configuration reload failed',
      timestamp,
      error: error.message
    };

    res.status(500).json(errorResponse);
  }
});

module.exports = router;
