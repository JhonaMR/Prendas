/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN PARA DESPACHOS
 * 
 * Permite que usuarios general creen despachos, pero solo admin puede editar/eliminar
 */

const { isAdmin, isGeneral } = require('../utils/permissions');

/**
 * Middleware para permitir crear despachos a admin y general
 */
const allowDispatchCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear despachos'
        });
    }

    next();
};

/**
 * Middleware para permitir editar/eliminar despachos solo a admin
 */
const allowDispatchEditDelete = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'Solo administradores pueden editar o eliminar despachos'
        });
    }

    next();
};

module.exports = {
    allowDispatchCreate,
    allowDispatchEditDelete
};
