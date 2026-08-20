/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN PARA DESPACHOS
 * 
 * Permite que usuarios general creen despachos, pero solo admin puede editar/eliminar
 */

const { isAdmin, isGeneral, isSoporte } = require('../utils/permissions');

/**
 * Middleware para permitir crear despachos a admin, general y soporte
 */
const allowDispatchCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user) && !isSoporte(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear despachos'
        });
    }

    next();
};

/**
 * Middleware para permitir editar/eliminar despachos a admin y soporte
 */
const allowDispatchEditDelete = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isSoporte(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'Solo administradores o soporte pueden editar o eliminar despachos'
        });
    }

    next();
};

module.exports = {
    allowDispatchCreate,
    allowDispatchEditDelete
};
