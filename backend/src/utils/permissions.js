/**
 * 🔐 UTILIDADES DE PERMISOS
 * 
 * Funciones para verificar permisos de usuarios basados en su rol
 * Soporta roles: admin, observer, general, diseñadora
 */

/**
 * Verificar si un usuario es observador
 * @param {Object} user - Objeto de usuario con propiedad 'role'
 * @returns {boolean} true si el usuario es observador
 */
function isObserver(user) {
    if (!user || !user.role) return false;
    return user.role.toLowerCase().trim() === 'observer';
}

/**
 * Verificar si un usuario es administrador
 * @param {Object} user - Objeto de usuario con propiedad 'role'
 * @returns {boolean} true si el usuario es administrador
 */
function isAdmin(user) {
    if (!user || !user.role) return false;
    return user.role.toLowerCase().trim() === 'admin';
}

/**
 * Verificar si un usuario es usuario general
 * @param {Object} user - Objeto de usuario con propiedad 'role'
 * @returns {boolean} true si el usuario es usuario general
 */
function isGeneral(user) {
    if (!user || !user.role) return false;
    return user.role.toLowerCase().trim() === 'general';
}

/**
 * Verificar si un usuario es diseñadora
 * @param {Object} user - Objeto de usuario con propiedad 'role'
 * @returns {boolean} true si el usuario es diseñadora
 */
function isDiseñadora(user) {
    if (!user || !user.role) return false;
    return user.role.toLowerCase().trim() === 'diseñadora';
}

/**
 * Verificar si un usuario puede acceder a una sección
 * @param {Object} user - Objeto de usuario
 * @param {string} section - Nombre de la sección (ej: 'dashboard', 'maestras', 'users')
 * @returns {boolean} true si el usuario puede acceder a la sección
 */
function canAccessSection(user, section) {
    if (!user || !section) return false;

    const role = user.role.toLowerCase().trim();
    const sectionLower = section.toLowerCase().trim();

    // Admin puede acceder a todo
    if (role === 'admin') return true;

    // Observer puede acceder a todo excepto user management
    if (role === 'observer') {
        return sectionLower !== 'user-management' && sectionLower !== 'maestras-usuarios';
    }

    // Diseñadora solo puede acceder a secciones limitadas
    if (role === 'diseñadora') {
        return sectionLower === 'inventory' || 
               sectionLower === 'orders' || 
               sectionLower === 'delivery-dates';
    }

    // General solo puede acceder a secciones limitadas
    if (role === 'general') {
        return sectionLower !== 'dashboard' && 
               sectionLower !== 'maestras' && 
               sectionLower !== 'user-management' &&
               sectionLower !== 'maestras-usuarios';
    }

    return false;
}

/**
 * Verificar si un usuario puede editar
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede editar
 */
function canEdit(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Solo admin puede editar
    return role === 'admin';
}

/**
 * Verificar si un usuario puede crear
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede crear
 */
function canCreate(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Solo admin puede crear
    return role === 'admin';
}

/**
 * Verificar si un usuario puede eliminar
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede eliminar
 */
function canDelete(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Solo admin puede eliminar
    return role === 'admin';
}

/**
 * Verificar si un usuario puede acceder a gestión de usuarios
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede acceder a gestión de usuarios
 */
function canAccessUserManagement(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Solo admin puede acceder a gestión de usuarios
    return role === 'admin';
}

/**
 * Verificar si un usuario puede asignar roles
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede asignar roles
 */
function canAssignRoles(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Solo admin puede asignar roles
    return role === 'admin';
}

/**
 * Verificar si un usuario puede acceder al dashboard
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} true si el usuario puede acceder al dashboard
 */
function canAccessDashboard(user) {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase().trim();
    // Admin y observer pueden acceder al dashboard
    return role === 'admin' || role === 'observer';
}

/**
 * Obtener el nivel de permiso de un usuario
 * @param {Object} user - Objeto de usuario
 * @returns {string} Nivel de permiso: 'FULL', 'READ_ONLY', 'LIMITED'
 */
function getPermissionLevel(user) {
    if (!user || !user.role) return 'NONE';
    
    const role = user.role.toLowerCase().trim();
    
    if (role === 'admin') return 'FULL';
    if (role === 'observer') return 'READ_ONLY';
    if (role === 'general') return 'LIMITED';
    if (role === 'diseñadora') return 'LIMITED';
    
    return 'NONE';
}

module.exports = {
    isObserver,
    isAdmin,
    isGeneral,
    isDiseñadora,
    canAccessSection,
    canEdit,
    canCreate,
    canDelete,
    canAccessUserManagement,
    canAssignRoles,
    canAccessDashboard,
    getPermissionLevel
};
