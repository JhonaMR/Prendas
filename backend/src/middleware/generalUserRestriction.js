/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN PARA OPERACIONES DE USUARIO GENERAL
 */

const { isAdmin, isGeneral, isSoporte, isOperador } = require('../utils/permissions');

const allowReceptionCreate = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isGeneral(req.user) && !isOperador(req.user))
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear recepciones' });
    next();
};

const allowComprasCreate = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isGeneral(req.user) && !isSoporte(req.user) && !isOperador(req.user))
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear compras' });
    next();
};

const allowOrdersCreate = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isGeneral(req.user))
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear órdenes' });
    next();
};

const allowDeliveryDatesCreate = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isGeneral(req.user) && !isSoporte(req.user) && !isOperador(req.user))
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear fechas de entrega' });
    next();
};

const allowAdminOnly = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isSoporte(req.user))
        return res.status(403).json({ success: false, message: 'Solo administradores y soporte pueden editar o eliminar' });
    next();
};

const allowOperadorOrAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
    if (!isAdmin(req.user) && !isSoporte(req.user) && !isOperador(req.user))
        return res.status(403).json({ success: false, message: 'No tienes permiso para esta operación' });
    next();
};

module.exports = {
    allowReceptionCreate,
    allowComprasCreate,
    allowOrdersCreate,
    allowDeliveryDatesCreate,
    allowAdminOnly,
    allowOperadorOrAdmin,
};
