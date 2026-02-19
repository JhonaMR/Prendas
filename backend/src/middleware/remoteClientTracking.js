/**
 * 🌐 REMOTE CLIENT TRACKING MIDDLEWARE
 * 
 * Tracks remote client connections and logs which IP is being used
 * for database connections. Ensures that remote clients use the detected
 * network IP instead of localhost.
 */

const logger = require('../controllers/shared/logger');
const configurationManager = require('../config/configurationManager');

/**
 * Middleware to track remote client connections
 * Logs client IP and database connection details
 */
function trackRemoteClient(req, res, next) {
  try {
    // Get client IP address
    const clientIP = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.connection.socket?.remoteAddress ||
                     'unknown';

    // Get configuration
    const config = configurationManager.getConfiguration();

    // Log remote client connection
    logger.debug('🌐 Remote Client Connection:', {
      clientIP,
      method: req.method,
      path: req.path,
      dbHost: config.DB_HOST,
      detectedIP: config.DETECTED_IP,
      nodeEnv: config.NODE_ENV
    });

    // Store client info in request for later use
    req.clientIP = clientIP;
    req.dbHost = config.DB_HOST;
    req.detectedIP = config.DETECTED_IP;

    // Verify that remote clients are using the detected IP
    if (clientIP !== 'localhost' && clientIP !== '127.0.0.1' && clientIP !== '::1') {
      // This is a remote client
      if (config.NODE_ENV === 'production' || config.NODE_ENV === 'staging') {
        // In production/staging, ensure we're using detected IP
        if (config.DB_HOST === 'localhost') {
          logger.warn('⚠️ Remote client detected but using localhost for database connection', {
            clientIP,
            dbHost: config.DB_HOST,
            detectedIP: config.DETECTED_IP
          });
        } else {
          logger.debug('✅ Remote client using correct database host', {
            clientIP,
            dbHost: config.DB_HOST
          });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('❌ Error in remote client tracking middleware', error);
    next();
  }
}

/**
 * Middleware to log database operations for remote clients
 * Tracks which IP is being used for each database operation
 */
function logDatabaseOperation(req, res, next) {
  try {
    // Intercept response to log database operations
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log successful database operations from remote clients
      if (req.clientIP && req.clientIP !== 'localhost' && req.clientIP !== '127.0.0.1') {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logger.info('✅ Remote client database operation successful', {
            clientIP: req.clientIP,
            method: req.method,
            path: req.path,
            dbHost: req.dbHost,
            statusCode: res.statusCode
          });
        }
      }
      
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('❌ Error in database operation logging middleware', error);
    next();
  }
}

module.exports = {
  trackRemoteClient,
  logDatabaseOperation
};
