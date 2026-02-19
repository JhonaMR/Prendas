/**
 * 🔐 CONTROLADOR DE AUTENTICACIÓN - POSTGRESQL
 * 
 * Maneja todo lo relacionado con usuarios y autenticación:
 * - Login (con loginCode + PIN)
 * - Registro de nuevos usuarios
 * - Cambio de PIN
 * - Listar usuarios (solo admin)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, generateId } = require('../config/database');
const logger = require('../utils/logger');

/**
 * LOGIN - Autenticar usuario
 * POST /api/auth/login
 * Body: { loginCode: "JAM", pin: "1234" }
 */
const login = async (req, res) => {
    try {
        const { loginCode, pin } = req.body;

        // ===== VALIDACIONES =====

        // Validar que vienen los campos
        if (!loginCode || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Login code y PIN son requeridos'
            });
        }

        // Validar formato de loginCode (3 letras)
        if (loginCode.length !== 3 || !/^[A-Za-z]{3}$/.test(loginCode)) {
            return res.status(400).json({
                success: false,
                message: 'Login code debe tener exactamente 3 letras'
            });
        }

        // Validar formato de PIN (4 dígitos)
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                message: 'PIN debe tener exactamente 4 dígitos numéricos'
            });
        }

        // ===== BUSCAR USUARIO =====

        const result = await query(`
            SELECT id, name, login_code, pin_hash, role, active
            FROM users
            WHERE UPPER(login_code) = UPPER($1)
        `, [loginCode]);

        // Usuario no existe
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = result.rows[0];

        // Usuario inactivo
        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacta al administrador.'
            });
        }

        // ===== VERIFICAR PIN =====

        const validPin = bcrypt.compareSync(pin, user.pin_hash);

        if (!validPin) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // ===== GENERAR TOKEN JWT =====

        const token = jwt.sign(
            {
                id: user.id,
                loginCode: user.login_code,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET || 'secret_default',
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        );

        // ===== ACTUALIZAR ÚLTIMA CONEXIÓN =====

        await query(`
            UPDATE users
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [user.id]);

        // ===== RESPUESTA EXITOSA =====

        return res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    loginCode: user.login_code,
                    role: user.role
                }
            }
        });

    } catch (error) {
        logger.error('❌ Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * REGISTRO - Crear nuevo usuario
 * POST /api/auth/register
 * Body: { name: "Nombre", loginCode: "ABC", pin: "1234" }
 */
const register = async (req, res) => {
    try {
        const { name, loginCode, pin, role } = req.body;

        // ===== VALIDACIONES =====

        if (!name || !loginCode || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, login code y PIN son requeridos'
            });
        }

        if (name.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener al menos 3 caracteres'
            });
        }

        if (loginCode.length !== 3 || !/^[A-Za-z]{3}$/.test(loginCode)) {
            return res.status(400).json({
                success: false,
                message: 'Login code debe tener exactamente 3 letras (A-Z)'
            });
        }

        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({
                success: false,
                message: 'PIN debe tener exactamente 4 dígitos numéricos'
            });
        }

        // ===== VERIFICAR SI YA EXISTE =====

        const existingResult = await query(`
            SELECT id FROM users
            WHERE UPPER(login_code) = UPPER($1)
        `, [loginCode]);

        if (existingResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este código de usuario ya está en uso'
            });
        }

        // ===== CREAR USUARIO =====

        // Hashear PIN
        const pinHash = bcrypt.hashSync(pin, 10);

        // Generar ID único
        const id = generateId();

        // Insertar usuario (siempre usar rol 'general' por defecto, nunca 'observer')
        const userRole = 'general';
        
        await query(`
            INSERT INTO users (id, name, login_code, pin_hash, role, active)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [id, name, loginCode.toUpperCase(), pinHash, userRole, true]);

        // ===== RESPUESTA EXITOSA =====

        return res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id,
                name,
                loginCode: loginCode.toUpperCase(),
                role: userRole
            }
        });

    } catch (error) {
        logger.error('❌ Error en registro:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * CAMBIAR PIN
 * POST /api/auth/change-pin
 * Body: { loginCode: "JAM", currentPin: "1234", newPin: "5678" }
 * Headers: Authorization: Bearer <token>
 */
const changePin = async (req, res) => {
    try {
        const { loginCode, currentPin, newPin } = req.body;

        // ===== VALIDACIONES =====

        if (!loginCode || !currentPin || !newPin) {
            return res.status(400).json({
                success: false,
                message: 'Login code, PIN actual y nuevo PIN son requeridos'
            });
        }

        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            return res.status(400).json({
                success: false,
                message: 'El nuevo PIN debe tener exactamente 4 dígitos numéricos'
            });
        }

        if (currentPin === newPin) {
            return res.status(400).json({
                success: false,
                message: 'El nuevo PIN debe ser diferente al actual'
            });
        }

        // ===== BUSCAR USUARIO =====

        const result = await query(`
            SELECT id, pin_hash, active
            FROM users
            WHERE UPPER(login_code) = UPPER($1)
        `, [loginCode]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];

        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // ===== VERIFICAR PIN ACTUAL =====

        const validPin = bcrypt.compareSync(currentPin, user.pin_hash);

        if (!validPin) {
            return res.status(401).json({
                success: false,
                message: 'PIN actual incorrecto'
            });
        }

        // ===== ACTUALIZAR PIN =====

        const newPinHash = bcrypt.hashSync(newPin, 10);

        await query(`
            UPDATE users
            SET pin_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [newPinHash, user.id]);

        // ===== RESPUESTA EXITOSA =====

        return res.json({
            success: true,
            message: 'PIN actualizado exitosamente'
        });

    } catch (error) {
        logger.error('❌ Error al cambiar PIN:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al cambiar PIN',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * LISTAR USUARIOS (Solo admin)
 * GET /api/auth/users
 * Headers: Authorization: Bearer <token>
 */
const listUsers = async (req, res) => {
    try {
        // Verificar que el usuario sea admin (esto se hace en el middleware auth)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        const result = await query(`
            SELECT id, name, login_code, role, active, created_at
            FROM users
            WHERE CAST(active AS INTEGER) = 1
            ORDER BY created_at DESC
        `);

        return res.json({
            success: true,
            data: result.rows.map(u => ({
                id: u.id,
                name: u.name,
                loginCode: u.login_code,
                role: u.role,
                active: u.active,
                createdAt: u.created_at
            }))
        });

    } catch (error) {
        logger.error('❌ Error al listar usuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al listar usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ACTUALIZAR USUARIO (Solo admin)
 * PUT /api/auth/users/:id
 * Body: { name: "Nuevo Nombre", role: "admin" | "observer" | "general" }
 * Headers: Authorization: Bearer <token>
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;

        // ===== VALIDACIONES =====

        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y rol son requeridos'
            });
        }

        if (name.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener al menos 3 caracteres'
            });
        }

        // Normalizar rol a minúsculas
        const normalizedRole = role.toLowerCase();

        if (!['admin', 'observer', 'general'].includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: 'El rol debe ser "admin", "observer" o "general"'
            });
        }

        // ===== ACTUALIZAR USUARIO =====

        const result = await query(`
            UPDATE users
            SET name = $1, role = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, name, role
        `, [name, normalizedRole, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const updatedUser = result.rows[0];

        return res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                role: updatedUser.role
            }
        });

    } catch (error) {
        logger.error('❌ Error al actualizar usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ELIMINAR USUARIO (Solo admin) - Hard delete
 * DELETE /api/auth/users/:id
 * Headers: Authorization: Bearer <token>
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info('🗑️ DELETE /api/auth/users/:id - Intentando eliminar usuario con ID:', id);

        // Verificar que el usuario existe
        const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (userResult.rows.length === 0) {
            logger.info('❌ Usuario no encontrado');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = userResult.rows[0];
        logger.info('📊 Usuario encontrado:', `${user.name} (${user.login_code})`);

        // Hard delete: eliminar completamente
        logger.info('🔥 Ejecutando DELETE FROM users WHERE id =', id);
        const result = await query('DELETE FROM users WHERE id = $1', [id]);
        logger.info('📝 Resultado de DELETE:', result);

        if (result.rowCount === 0) {
            logger.info('❌ No se eliminó nada');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        logger.info('✅ Usuario eliminado exitosamente - cambios:', result.rowCount);
        return res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        logger.error('❌ Error al eliminar usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    login,
    register,
    changePin,
    listUsers,
    updateUser,
    deleteUser
};
