/**
 * 🔐 CONTROLADOR DE AUTENTICACIÓN
 * 
 * Maneja todo lo relacionado con usuarios y autenticación:
 * - Login (con loginCode + PIN)
 * - Registro de nuevos usuarios
 * - Cambio de PIN
 * - Listar usuarios (solo admin)
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase, generateId } = require('../config/database');

/**
 * LOGIN - Autenticar usuario
 * POST /api/auth/login
 * Body: { loginCode: "JAM", pin: "1234" }
 */
const login = (req, res) => {
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

        const db = getDatabase();

        try {
            // Buscar usuario por login_code (case-insensitive)
            const user = db.prepare(`
                SELECT id, name, login_code, pin_hash, role, active
                FROM users
                WHERE UPPER(login_code) = UPPER(?)
            `).get(loginCode);

            // Usuario no existe
            if (!user) {
                db.close();
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Usuario inactivo
            if (!user.active) {
                db.close();
                return res.status(401).json({
                    success: false,
                    message: 'Usuario inactivo. Contacta al administrador.'
                });
            }

            // ===== VERIFICAR PIN =====

            const validPin = bcrypt.compareSync(pin, user.pin_hash);

            if (!validPin) {
                db.close();
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

            db.prepare(`
                UPDATE users
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(user.id);

            db.close();

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
        } catch (dbError) {
            db.close();
            throw dbError;
        }

    } catch (error) {
        console.error('❌ Error en login:', error);
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
const register = (req, res) => {
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

        const db = getDatabase();

        const existing = db.prepare(`
            SELECT id FROM users
            WHERE UPPER(login_code) = UPPER(?)
        `).get(loginCode);

        if (existing) {
            db.close();
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

        // Insertar usuario (usar rol proporcionado o 'general' por defecto)
        const userRole = role && ['admin', 'general'].includes(role) ? role : 'general';
        
        db.prepare(`
            INSERT INTO users (id, name, login_code, pin_hash, role, active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(id, name, loginCode.toUpperCase(), pinHash, userRole);

        db.close();

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
        console.error('❌ Error en registro:', error);
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
const changePin = (req, res) => {
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

        const db = getDatabase();

        const user = db.prepare(`
            SELECT id, pin_hash, active
            FROM users
            WHERE UPPER(login_code) = UPPER(?)
        `).get(loginCode);

        if (!user) {
            db.close();
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!user.active) {
            db.close();
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // ===== VERIFICAR PIN ACTUAL =====

        const validPin = bcrypt.compareSync(currentPin, user.pin_hash);

        if (!validPin) {
            db.close();
            return res.status(401).json({
                success: false,
                message: 'PIN actual incorrecto'
            });
        }

        // ===== ACTUALIZAR PIN =====

        const newPinHash = bcrypt.hashSync(newPin, 10);

        db.prepare(`
            UPDATE users
            SET pin_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(newPinHash, user.id);

        db.close();

        // ===== RESPUESTA EXITOSA =====

        return res.json({
            success: true,
            message: 'PIN actualizado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al cambiar PIN:', error);
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
const listUsers = (req, res) => {
    let db;
    try {
        // Verificar que el usuario sea admin (esto se hace en el middleware auth)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        db = getDatabase();

        const users = db.prepare(`
            SELECT id, name, login_code, role, active, created_at
            FROM users
            WHERE active = 1
            ORDER BY created_at DESC
        `).all();

        db.close();

        return res.json({
            success: true,
            data: users.map(u => ({
                id: u.id,
                name: u.name,
                loginCode: u.login_code,
                role: u.role,
                active: u.active === 1,
                createdAt: u.created_at
            }))
        });

    } catch (error) {
        if (db) db.close();
        console.error('❌ Error al listar usuarios:', error);
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
 * Body: { name: "Nuevo Nombre", role: "admin" }
 * Headers: Authorization: Bearer <token>
 */
const updateUser = (req, res) => {
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

        if (!['admin', 'general'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'El rol debe ser "admin" o "general"'
            });
        }

        // ===== ACTUALIZAR USUARIO =====

        const db = getDatabase();

        const result = db.prepare(`
            UPDATE users
            SET name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
            WHERE LOWER(id) = LOWER(?)
        `).run(name, role, id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: { id, name, role }
        });

    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * ELIMINAR USUARIO (Solo admin) - Soft delete
 * DELETE /api/auth/users/:id
 * Headers: Authorization: Bearer <token>
 */
const deleteUser = (req, res) => {
    try {
        const { id } = req.params;
        console.log('🗑️ DELETE /api/auth/users/:id - Intentando eliminar usuario con ID:', id);

        const db = getDatabase();

        // Verificar que el usuario existe
        const user = db.prepare('SELECT * FROM users WHERE LOWER(id) = LOWER(?)').get(id);
        console.log('📊 Usuario encontrado:', user ? `${user.name} (${user.login_code})` : 'NO ENCONTRADO');

        if (!user) {
            db.close();
            console.log('❌ Usuario no encontrado');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Hard delete: eliminar completamente
        console.log('🔥 Ejecutando DELETE FROM users WHERE id =', id);
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        console.log('📝 Resultado de DELETE:', result);

        db.close();

        if (result.changes === 0) {
            console.log('❌ No se eliminó nada');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('✅ Usuario eliminado exitosamente - cambios:', result.changes);
        return res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
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
