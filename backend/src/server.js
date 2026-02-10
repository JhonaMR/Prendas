/**
 * 🚀 SERVIDOR PRINCIPAL
 * 
 * Este es el punto de entrada del backend
 * Configura Express, middlewares, rutas y arranca el servidor
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const apiRoutes = require('./routes');

// Crear aplicación Express
const app = express();

// Obtener puerto y host de variables de entorno
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

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
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
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
 * El frontend compilado estará en ../frontend/dist
 */
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

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
    console.error('❌ Error no manejado:', err);
    
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
app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR BACKEND INICIADO');
    console.log('='.repeat(60));
    console.log(`📍 URL Local:    http://localhost:${PORT}`);
    console.log(`📍 URL Red:      http://${getLocalIP()}:${PORT}`);
    console.log(`📁 Entorno:      ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 CORS habilitado para:`, corsOptions.origin.join(', '));
    console.log('='.repeat(60));
    console.log('\n✅ El backend está listo para recibir peticiones');
    console.log('📝 Los logs de peticiones aparecerán abajo:\n');
});

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
process.on('SIGINT', () => {
    console.log('\n\n🛑 Servidor detenido por el usuario');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Servidor detenido');
    process.exit(0);
});

module.exports = app;
