/**
 * 🔐 MIDDLEWARE DE AUTENTICACIÓN
 * 
 * Verifica que el usuario tenga un token JWT válido
 * Se ejecuta antes de los endpoints protegidos
 */

const jwt = require('jsonwebtoken');

/**
 * Verificar Token JWT
 * Este middleware se ejecuta antes de los endpoints protegidos
 */
const verifyToken = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        // Formato: "Authorization: Bearer TOKEN_AQUI"
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        // Extraer el token (quitar "Bearer ")
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_default');

        // Agregar información del usuario a la request
        // Los controladores pueden acceder a esto con req.user
        req.user = {
            id: decoded.id,
            loginCode: decoded.loginCode,
            name: decoded.name,
            role: decoded.role
        };

        // Continuar con el siguiente middleware/controlador
        next();

    } catch (error) {
        // Token expirado o inválido
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor, inicia sesión nuevamente.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

/**
 * Verificar que el usuario sea Admin
 * Se usa después de verifyToken
 */
const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    const userRole = (req.user.role || '').trim().toLowerCase();
    console.log('🔍 Verificando admin - Usuario:', req.user.loginCode, 'Rol:', userRole, 'Rol original:', req.user.role);

    if (userRole !== 'admin' && userRole !== 'soporte') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos de administrador para realizar esta acción'
        });
    }

    next();
};

/**
 * Verificar que el usuario sea Admin o Observer
 * Se usa después de verifyToken para permitir acceso a dashboard
 */
const verifyAdminOrObserver = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    const userRole = (req.user.role || '').trim().toLowerCase();
    console.log('🔍 Verificando admin o observer - Usuario:', req.user.loginCode, 'Rol:', userRole);

    if (userRole !== 'admin' && userRole !== 'observer' && userRole !== 'soporte') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a esta sección'
        });
    }

    next();
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyAdminOrObserver
};
