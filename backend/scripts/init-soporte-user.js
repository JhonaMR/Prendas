#!/usr/bin/env node

/**
 * Script para inicializar el usuario Soporte en la base de datos
 * Uso: node init-soporte-user.js
 */

const bcrypt = require('bcrypt');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { initializeConfiguration } = require('../src/config/configurationManager');
const { initDatabase, query, generateId, closePool } = require('../src/config/database');

const SOPORTE_LOGIN_CODE = 'SOP';
const SOPORTE_PIN = '3438';
const SOPORTE_NAME = 'Soporte';
const SOPORTE_ROLE = 'soporte';

async function initSoporteUser() {
    try {
        console.log('🔐 Inicializando usuario Soporte...\n');

        // Inicializar configuración
        initializeConfiguration();

        // Inicializar base de datos
        await initDatabase();

        // Verificar si el usuario ya existe
        const existingResult = await query(
            'SELECT id, name FROM users WHERE login_code = $1',
            [SOPORTE_LOGIN_CODE]
        );

        if (existingResult.rows.length > 0) {
            console.log('✅ El usuario Soporte ya existe:');
            console.log(`   ID: ${existingResult.rows[0].id}`);
            console.log(`   Nombre: ${existingResult.rows[0].name}\n`);
            await closePool();
            process.exit(0);
        }

        // Generar hash del PIN
        const pinHash = bcrypt.hashSync(SOPORTE_PIN, 10);
        const userId = generateId();

        // Insertar el usuario Soporte
        await query(
            `INSERT INTO users (id, name, login_code, pin_hash, role, active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [userId, SOPORTE_NAME, SOPORTE_LOGIN_CODE, pinHash, SOPORTE_ROLE, 1]
        );

        console.log('✅ Usuario Soporte creado exitosamente:\n');
        console.log(`   ID: ${userId}`);
        console.log(`   Nombre: ${SOPORTE_NAME}`);
        console.log(`   Login Code: ${SOPORTE_LOGIN_CODE}`);
        console.log(`   PIN: ${SOPORTE_PIN}`);
        console.log(`   Rol: ${SOPORTE_ROLE}`);
        console.log(`   Activo: true\n`);

        await closePool();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error al inicializar usuario Soporte:', error.message);
        try {
            await closePool();
        } catch (e) {
            // Ignorar errores al cerrar
        }
        process.exit(1);
    }
}

// Ejecutar
initSoporteUser();
