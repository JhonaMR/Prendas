/**
 * Re-export del logger centralizado
 * Este archivo existe para mantener compatibilidad con las importaciones existentes
 * que usan require('../utils/logger')
 */

const logger = require('../controllers/shared/logger');

module.exports = logger;