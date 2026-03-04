/**
 * 🚀 SERVIDOR PRINCIPAL - POSTGRESQL
 * 
 * Este es el punto de entrada del backend
 * Configura Express, middlewares, rutas, inicializa PostgreSQL y arranca el servidor
 */

const path = require('path');
const fs = require('fs');

// Determinar cuál archivo .env cargar basado en el nombre del proceso PM2
let envFile = '.env';
const processName = process.env.pm_id ? process.env.name : '';

if (processName.includes('melas')) {
  envFile = '.env.melas';
} else if (processName.includes('plow')) {
  envFile = '.env.prendas';
} else if (fs.existsSync(path.join(__dirname, '../.env.melas'))) {
  // Si no hay nombre de proceso, intentar detectar por archivo
  envFile = '.env.melas';
} else {
  envFile = '.env.prendas';
}

require('dotenv').config({ path: path.join(__dirname, '../' + envFile) });
const express = require('express');
const cors = require('cors');
const https = require('https');

// Importar configuración y rutas
const { initDatabase, closePool } = require('./config/database');
const apiRoutes = require('./routes');
const logger = require('./utils/logger');
const configurationManager = require('./config/configurationManager');
const postgres = require('./config/postgres');
const { trackRemoteClient, logDatabaseOperation } = require('./middleware/remoteClientTracking');
const { initializeSocket } = require('./config/socketio');
const { startCleanupJob } = require('./jobs/cleanupMessagesJob');

// Crear aplicación Express
const app = express();

// Obtener puerto y host de variables de entorno
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const USE_HTTPS = process.env.USE_HTTPS !== 'false'; // true por defecto

// ==================== MIDDLEWARES ====================

/**
 * CORS - Permitir peticiones desde el frontend
 * En desarrollo: http://localhost:5173 (Vite)
 * En producción: http://IP_SERVIDOR:3000
 */
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/**
 * Parser de JSON
 * Permite recibir datos JSON en las peticiones
 */
app.use(express.json());

/**
 * Parser de URL-encoded
 * Permite recibir datos de formularios
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Logger simple
 * Muestra en consola cada petición que llega
 */
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    logger.info(`${req.method} ${req.path}`);
    next();
});

/**
 * Middleware para rastrear conexiones de clientes remotos
 * Registra qué IP se usa para cada conexión a la base de datos
 */
app.use(trackRemoteClient);
app.use(logDatabaseOperation);

/**
 * Middleware para verificar que la base de datos esté lista
 * Retorna 503 Service Unavailable si la BD no está disponible
 * Excepto para el endpoint /health que siempre debe estar disponible
 */
app.use((req, res, next) => {
    // Permitir acceso al endpoint de health sin verificación
    if (req.path === '/health') {
        return next();
    }

    // Verificar estado de conexión
    const connectionStatus = postgres.getConnectionStatus();
    if (!connectionStatus.connected) {
        logger.warn(`⚠️ Solicitud rechazada: Base de datos no disponible (${req.method} ${req.path})`);
        return res.status(503).json({
            success: false,
            message: 'Base de datos no disponible. Por favor, intente más tarde.',
            status: 'service_unavailable'
        });
    }

    next();
});

// ==================== RUTAS ====================

/**
 * Rutas del API
 * Todas las rutas empiezan con /api
 */
app.use('/api', apiRoutes);

/**
 * Servir archivos estáticos del frontend (cuando esté compilado)
 * El frontend compilado estará en ../dist
 */
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

/**
 * Servir archivos estáticos de la carpeta public (fotos, etc)
 */
const publicPath = path.join(__dirname, '../../public');
app.use(express.static(publicPath));

/**
 * Ruta para el frontend (SPA - Single Page Application)
 * Todas las rutas que no empiecen con /api devuelven index.html
 * Esto permite que React Router funcione correctamente
 */
app.get('*', (req, res) => {
    // Si la ruta es del API, continuar
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado'
        });
    }

    // Si no, servir el frontend
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== MANEJO DE ERRORES ====================

/**
 * Middleware de manejo de errores
 * Captura errores no manejados
 */
app.use((err, req, res, next) => {
    logger.error('Error no manejado:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==================== INICIAR SERVIDOR ====================

/**
 * Iniciar servidor en el puerto configurado
 */
async function startServer() {
    try {
        // Inicializar configuración con detección de red
        logger.info('🔧 Inicializando configuración con detección de red...');
        await configurationManager.initializeConfiguration();
        logger.info('✅ Configuración inicializada correctamente');

        // Inicializar pool de conexiones con fallback
        logger.info('🗄️ Inicializando pool de conexiones con fallback...');
        await postgres.initPoolWithFallback();
        logger.info('✅ Pool de conexiones inicializado correctamente');

        // Validar conectividad de base de datos
        logger.info('🏥 Validando conectividad de base de datos...');
        const isHealthy = await postgres.healthCheck();
        if (!isHealthy) {
            logger.warn('⚠️ Health check falló, pero continuando con la inicialización...');
        } else {
            logger.info('✅ Base de datos lista para aceptar solicitudes');
        }

        // Crear servidor HTTPS o HTTP según configuración
        let server;
        const protocol = USE_HTTPS ? 'https' : 'http';
        
        if (USE_HTTPS) {
            const certDir = path.join(__dirname, '../certs');
            const keyPath = path.join(certDir, 'server.key');
            const certPath = path.join(certDir, 'server.crt');
            
            // Verificar si existen los certificados
            if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
                console.error('\n❌ Certificados SSL no encontrados');
                console.error(`   Ejecuta: node backend/scripts/generate-ssl-cert.js`);
                process.exit(1);
            }
            
            const options = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            };
            
            server = https.createServer(options, app);
        } else {
            const http = require('http');
            server = http.createServer(app);
        }

        // Inicializar Socket.io
        initializeSocket(server);

        // Iniciar job de limpieza de mensajes
        startCleanupJob();

        // Iniciar servidor
        server.listen(PORT, HOST, () => {
            const config = configurationManager.getConfiguration();
            console.log('\n' + '='.repeat(60));
            console.log('🚀 SERVIDOR BACKEND INICIADO');
            console.log('='.repeat(60));
            console.log(`📍 URL Local:    ${protocol}://localhost:${PORT}`);
            console.log(`📍 URL Red:      ${protocol}://${getLocalIP()}:${PORT}`);
            console.log(`📁 Entorno:      ${config.NODE_ENV}`);
            console.log(`🌐 IP Detectada: ${config.DETECTED_IP || 'No detectada'}`);
            console.log(`🗄️  Base de datos: PostgreSQL (${config.DB_HOST}:${config.DB_PORT})`);
            console.log(`🔐 CORS habilitado para:`, corsOptions.origin.join(', '));
            console.log(`🔒 Protocolo:    ${protocol.toUpperCase()}`);
            console.log(`🔌 Socket.io:    Activo`);
            console.log('='.repeat(60));
            console.log('\n✅ El backend está listo para recibir peticiones');
            console.log('📝 Los logs de peticiones aparecerán abajo:\n');
        });
    } catch (error) {
        logger.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

/**
 * Obtener IP local de la máquina
 * Útil para acceder desde otros PCs de la red
 */
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // IPv4 y no loopback
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    
    return 'localhost';
}

/**
 * Manejo de señales de terminación
 * Cerrar servidor correctamente al presionar Ctrl+C
 */
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Cerrando servidor...');
    try {
        await postgres.closePool();
        logger.info('✅ Pool de conexiones cerrado');
    } catch (error) {
        logger.error('Error cerrando pool:', error);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Servidor detenido');
    try {
        await postgres.closePool();
        logger.info('✅ Pool de conexiones cerrado');
    } catch (error) {
        logger.error('Error cerrando pool:', error);
    }
    process.exit(0);
});

// Iniciar servidor
startServer();
