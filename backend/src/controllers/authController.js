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

        // Buscar usuario por login_code (case-insensitive)
        const user = db.prepare(`
            SELECT id, name, login_code, pin_hash, role, active
            FROM users
            WHERE UPPER(login_code) = UPPER(?)
        `).get(loginCode);

        // Usuario no existe
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

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
        const { name, loginCode, pin } = req.body;

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

        // Insertar usuario (nuevos usuarios siempre son 'general')
        db.prepare(`
            INSERT INTO users (id, name, login_code, pin_hash, role, active)
            VALUES (?, ?, ?, ?, 'general', 1)
        `).run(id, name, loginCode.toUpperCase(), pinHash);

        db.close();

        // ===== RESPUESTA EXITOSA =====

        return res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id,
                name,
                loginCode: loginCode.toUpperCase(),
                role: 'general'
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
    try {
        // Verificar que el usuario sea admin (esto se hace en el middleware auth)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        const db = getDatabase();

        const users = db.prepare(`
            SELECT id, name, login_code, role, active, created_at
            FROM users
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
        console.error('❌ Error al listar usuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al listar usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    login,
    register,
    changePin,
    listUsers
};
