/**
 * ============================================================
 * SCRIPT: Crear usuario Soporte en base de datos Melas
 * ============================================================
 * Genera el SQL con un hash bcrypt real para el PIN que elijas,
 * y lo ejecuta directamente contra la base de datos de Melas.
 *
 * INSTRUCCIONES:
 *   1. Copiar este archivo al servidor donde corre el backend de Melas
 *   2. Asegurarse de estar en la carpeta del backend: cd /ruta/al/backend
 *   3. Ejecutar:
 *        node scripts/create-soporte-user.cjs
 *      O con un PIN personalizado:
 *        node scripts/create-soporte-user.cjs --pin 5678
 *
 * El script verifica si el usuario ya existe antes de crearlo.
 * ============================================================
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');

// ── Leer PIN desde argumento --pin XXXX, o usar "1234" por defecto ──
const args = process.argv.slice(2);
const pinIndex = args.indexOf('--pin');
const PIN = pinIndex !== -1 && args[pinIndex + 1] ? args[pinIndex + 1] : '1234';

// Validar PIN
if (!/^\d{4}$/.test(PIN)) {
    console.error('❌ El PIN debe tener exactamente 4 dígitos numéricos.');
    process.exit(1);
}

// ── Cargar variables de entorno (.env.melas si existe, si no .env) ──
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env.melas') });
    console.log('📄 Usando .env.melas');
} catch {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    console.log('📄 Usando .env');
}

// ── Función para generar ID igual que el backend ──
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function main() {
    console.log('');
    console.log('============================================================');
    console.log('  Crear usuario Soporte - Base de datos Melas');
    console.log('============================================================');
    console.log(`  PIN a usar: ${PIN}`);
    console.log('');

    // Conectar a la BD
    const pool = new Pool({
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();

    try {
        // 1. Verificar si ya existe
        console.log('🔍 Verificando si el usuario SOP ya existe...');
        const existing = await client.query(
            "SELECT id, name, login_code, role, active FROM users WHERE UPPER(login_code) = 'SOP'"
        );

        if (existing.rows.length > 0) {
            const u = existing.rows[0];
            console.log('');
            console.log('⚠️  El usuario Soporte ya existe en la base de datos:');
            console.log(`   ID:         ${u.id}`);
            console.log(`   Nombre:     ${u.name}`);
            console.log(`   Login code: ${u.login_code}`);
            console.log(`   Rol:        ${u.role}`);
            console.log(`   Activo:     ${u.active}`);
            console.log('');
            console.log('✅ No se realizaron cambios.');
            return;
        }

        // 2. Generar hash del PIN
        console.log('🔐 Generando hash del PIN...');
        const pinHash = await bcrypt.hash(PIN, 10);

        // 3. Insertar usuario
        const id = generateId();
        console.log('💾 Insertando usuario Soporte...');
        await client.query(
            `INSERT INTO users (id, name, login_code, pin_hash, role, active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, 'Soporte', 'SOP', pinHash, 'soporte', 1]
        );

        // 4. Confirmar
        const created = await client.query(
            "SELECT id, name, login_code, role, active, created_at FROM users WHERE UPPER(login_code) = 'SOP'"
        );
        const u = created.rows[0];

        console.log('');
        console.log('✅ Usuario Soporte creado exitosamente:');
        console.log(`   ID:         ${u.id}`);
        console.log(`   Nombre:     ${u.name}`);
        console.log(`   Login code: ${u.login_code}`);
        console.log(`   Rol:        ${u.role}`);
        console.log(`   Activo:     ${u.active}`);
        console.log(`   Creado:     ${u.created_at}`);
        console.log('');
        console.log(`🔑 PIN inicial: ${PIN}`);
        console.log('   ⚠️  Cambia el PIN desde la app después del primer acceso.');
        console.log('');

    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
