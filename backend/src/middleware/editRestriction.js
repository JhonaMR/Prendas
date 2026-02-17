/**
 * 🔒 MIDDLEWARE DE RESTRICCIÓN DE EDICIÓN
 * 
 * Previene que usuarios no-admin (observer y general) realicen operaciones de edición
 * Se aplica a endpoints PUT, POST (create), DELETE
 */

const { canEdit } = require('../utils/permissions');

/**
 * Middleware para prevenir ediciones de usuarios no-admin
 * Se usa en endpoints de PUT, POST (create), DELETE
 */
const preventNonAdminEdit = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado'
        });
    }

    // Verificar si el usuario puede editar
    if (!canEdit(req.user)) {
        return res.status(403).json({
            success: false,
            message: 'No puedes editar este recurso. Tu rol es de solo lectura'
        });
    }

    next();
};

module.exports = {
    preventNonAdminEdit
};
