/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN PARA OPERACIONES DE USUARIO GENERAL
 * 
 * Permite que usuarios general realicen operaciones específicas (crear recepciones, despachos, etc.)
 * pero solo admin puede editar/eliminar
 */

const { isAdmin, isGeneral, isSoporte } = require('../utils/permissions');

/**
 * Middleware para permitir crear recepciones a admin y general
 */
const allowReceptionCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear recepciones'
        });
    }

    next();
};

/**
 * Middleware para permitir crear compras a admin, general y soporte
 */
const allowComprasCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user) && !isSoporte(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear compras'
        });
    }

    next();
};

/**
 * Middleware para permitir crear órdenes/pedidos a admin y general
 */
const allowOrdersCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear órdenes'
        });
    }

    next();
};

/**
 * Middleware para permitir crear fechas de entrega a admin, general y soporte
 */
const allowDeliveryDatesCreate = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isGeneral(req.user) && !isSoporte(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para crear fechas de entrega'
        });
    }

    next();
};

/**
 * Middleware para permitir editar/eliminar a admin y soporte
 */
const allowAdminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    if (!isAdmin(req.user) && !isSoporte(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'Solo administradores y soporte pueden editar o eliminar'
        });
    }

    next();
};

module.exports = {
    allowReceptionCreate,
    allowComprasCreate,
    allowOrdersCreate,
    allowDeliveryDatesCreate,
    allowAdminOnly
};
