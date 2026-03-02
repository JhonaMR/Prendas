/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN PARA DEVOLUCIONES
 * 
 * Permite que usuarios general creen devoluciones, pero solo admin puede editar/eliminar
 */

const { isAdmin, isGeneral } = require('../utils/permissions');

/**
 * Middleware para permitir crear devoluciones a admin y general
 */
const allowReturnCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear devoluciones'
        });
    }

    next();
};

/**
 * Middleware para permitir editar/eliminar devoluciones solo a admin
 */
const allowReturnEditDelete = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'Solo administradores pueden editar o eliminar devoluciones'
        });
    }

    next();
};

module.exports = {
    allowReturnCreate,
    allowReturnEditDelete
};
