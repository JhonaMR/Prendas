/**
 * 📊 MÓDULO DE BASE DE DATOS
 * 
 * Este archivo maneja la conexión con SQLite y crea todas las tablas necesarias.
 * SQLite es una base de datos que se guarda en un solo archivo (inventory.db)
 * No requiere instalar ningún servidor de base de datos.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Ruta donde se guardará la base de datos
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database/inventory.db');

/**
 * Inicializar la base de datos
 * Crea el archivo si no existe y todas las tablas necesarias
 */
function initDatabase() {
    console.log('📊 Inicializando base de datos...');
    console.log('📁 Ruta de BD:', DB_PATH);

    // Crear carpeta database/ si no existe
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('✅ Carpeta de base de datos creada');
    }

    // Conectar a la base de datos (se crea si no existe)
    const db = new Database(DB_PATH);
    
    // Habilitar foreign keys (para mantener integridad referencial)
    db.pragma('foreign_keys = ON');

    // ====================
    // TABLA: users (Usuarios del sistema)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            login_code TEXT UNIQUE NOT NULL CHECK(length(login_code) = 3),
            pin_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'general')) DEFAULT 'general',
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Índice para búsqueda rápida por login_code
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_login_code 
        ON users(login_code)
    `);

    console.log('✅ Tabla users creada');

    // ====================
    // TABLA: product_references (Referencias/Productos)
    // NOTA: Cambiado de "references" a "product_references" porque "references" es palabra reservada en SQLite
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS product_references (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            price REAL NOT NULL CHECK(price > 0),
            designer TEXT NOT NULL,
            cloth1 TEXT,
            avg_cloth1 REAL,
            cloth2 TEXT,
            avg_cloth2 REAL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tabla product_references creada');

    // ====================
    // TABLA: clients (Clientes)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            seller TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tabla clients creada');

    // ====================
    // TABLA: confeccionistas (Proveedores/Confeccionistas)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS confeccionistas (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            phone TEXT NOT NULL,
            score TEXT NOT NULL CHECK(score IN ('A', 'AA', 'AAA')),
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tabla confeccionistas creada');

    // ====================
    // TABLA: sellers (Vendedores)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS sellers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tabla sellers creada');

    // ====================
    // TABLA: correrias (Campañas de Ventas)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS correrias (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            year TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tabla correrias creada');

    // ====================
    // TABLA: receptions (Recepciones de Mercancía - Maestro)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS receptions (
            id TEXT PRIMARY KEY,
            batch_code TEXT NOT NULL,
            confeccionista TEXT NOT NULL,
            has_seconds INTEGER,
            charge_type TEXT,
            charge_units INTEGER NOT NULL DEFAULT 0,
            received_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (confeccionista) REFERENCES confeccionistas(id)
        )
    `);

    // ====================
    // TABLA: reception_items (Items de cada recepción - Detalle)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS reception_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reception_id TEXT NOT NULL,
            reference TEXT NOT NULL,
            size TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            FOREIGN KEY (reception_id) REFERENCES receptions(id) ON DELETE CASCADE,
            FOREIGN KEY (reference) REFERENCES product_references(id)
        )
    `);

    console.log('✅ Tablas receptions y reception_items creadas');

    // ====================
    // TABLA: dispatches (Despachos - Maestro)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS dispatches (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            invoice_no TEXT NOT NULL,
            remission_no TEXT NOT NULL,
            dispatched_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        )
    `);

    // ====================
    // TABLA: dispatch_items (Items de cada despacho - Detalle)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS dispatch_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dispatch_id TEXT NOT NULL,
            reference TEXT NOT NULL,
            size TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            FOREIGN KEY (dispatch_id) REFERENCES dispatches(id) ON DELETE CASCADE,
            FOREIGN KEY (reference) REFERENCES product_references(id)
        )
    `);

    console.log('✅ Tablas dispatches y dispatch_items creadas');

    // ====================
    // TABLA: orders (Pedidos - Maestro)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            client_id TEXT NOT NULL,
            seller_id TEXT NOT NULL,
            correria_id TEXT NOT NULL,
            total_value REAL NOT NULL,
            created_at TEXT NOT NULL,
            settled_by TEXT NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients(id),
            FOREIGN KEY (seller_id) REFERENCES sellers(id),
            FOREIGN KEY (correria_id) REFERENCES correrias(id)
        )
    `);

    // ====================
    // TABLA: order_items (Items de cada pedido - Detalle)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            reference TEXT NOT NULL,
            size TEXT NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (reference) REFERENCES product_references(id)
        )
    `);

    console.log('✅ Tablas orders y order_items creadas');

    // ====================
    // TABLA: production_tracking (Seguimiento de Producción)
    // ====================
    db.exec(`
        CREATE TABLE IF NOT EXISTS production_tracking (
            ref_id TEXT NOT NULL,
            correria_id TEXT NOT NULL,
            programmed INTEGER NOT NULL DEFAULT 0,
            cut INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (ref_id, correria_id),
            FOREIGN KEY (ref_id) REFERENCES product_references(id),
            FOREIGN KEY (correria_id) REFERENCES correrias(id)
        )
    `);

    console.log('✅ Tabla production_tracking creada');

    // ====================
    // INSERTAR DATOS INICIALES
    // ====================

    // Verificar si ya hay usuarios
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

    if (userCount.count === 0) {
        console.log('👤 Creando usuarios por defecto...');

        // Hashear PINs
        const adminPinHash = bcrypt.hashSync('0000', 10);
        const generalPinHash = bcrypt.hashSync('1234', 10);

        // Generar IDs únicos
        const adminId = generateId();
        const generalId = generateId();

        // Insertar usuarios por defecto
        const insertUser = db.prepare(`
            INSERT INTO users (id, name, login_code, pin_hash, role, active)
            VALUES (?, ?, ?, ?, ?, 1)
        `);

        insertUser.run(adminId, 'Admin Principal', 'ADM', adminPinHash, 'admin');
        insertUser.run(generalId, 'Jhon Montoya', 'JAM', generalPinHash, 'general');

        console.log('   ✅ Usuario creado: Admin Principal (ADM / 0000) - rol: admin');
        console.log('   ✅ Usuario creado: Jhon Montoya (JAM / 1234) - rol: general');
    }

    // Verificar si ya hay referencias
    const refCount = db.prepare('SELECT COUNT(*) as count FROM product_references').get();

    if (refCount.count === 0) {
        console.log('📦 Creando referencias de prueba...');

        const insertRef = db.prepare(`
            INSERT INTO product_references (id, description, price, designer, cloth1, avg_cloth1, cloth2, avg_cloth2, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);

        insertRef.run('10210', 'blusa dama', 19900, 'Estudio A', 'Lino', 0.85, 'Encaje', 0.15);
        insertRef.run('12877', 'blusa dama', 21900, 'Estudio B', 'Seda', 0.90, null, null);
        insertRef.run('12871', 'buso dama', 25900, 'Estudio A', 'Algodon', 1.2, null, null);

        console.log('   ✅ Referencia creada: 10210 - blusa dama');
        console.log('   ✅ Referencia creada: 12877 - blusa dama');
        console.log('   ✅ Referencia creada: 12871 - buso dama');
    }

    // Insertar datos de prueba adicionales (solo si no existen)
    const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    if (clientCount.count === 0) {
        console.log('🏢 Creando clientes de prueba...');
        
        const insertClient = db.prepare(`
            INSERT INTO clients (id, name, address, city, seller, active)
            VALUES (?, ?, ?, ?, ?, 1)
        `);

        insertClient.run('211', 'Media naranja', 'cll 77 a 45 a 30', 'Medellín', 'John');
        insertClient.run('212', 'La pantaleta', 'cll 83 # 57 a 14', 'Montería', 'Lina');

        console.log('   ✅ Cliente creado: 211 - Media naranja');
        console.log('   ✅ Cliente creado: 212 - La pantaleta');
    }

    const confCount = db.prepare('SELECT COUNT(*) as count FROM confeccionistas').get();
    if (confCount.count === 0) {
        console.log('👔 Creando confeccionista de prueba...');
        
        const insertConf = db.prepare(`
            INSERT INTO confeccionistas (id, name, address, city, phone, score, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `);

        insertConf.run('123', 'Taller Alfa', 'Calle 10 #20-30', 'Medellín', '3001234567', 'AAA');

        console.log('   ✅ Confeccionista creado: 123 - Taller Alfa');
    }

    const sellerCount = db.prepare('SELECT COUNT(*) as count FROM sellers').get();
    if (sellerCount.count === 0) {
        console.log('💼 Creando vendedores de prueba...');
        
        const insertSeller = db.prepare(`
            INSERT INTO sellers (id, name, active)
            VALUES (?, ?, 1)
        `);

        insertSeller.run('s1', 'Carlos Vendedor');
        insertSeller.run('s2', 'Marta Ventas');

        console.log('   ✅ Vendedor creado: s1 - Carlos Vendedor');
        console.log('   ✅ Vendedor creado: s2 - Marta Ventas');
    }

    const correriaCount = db.prepare('SELECT COUNT(*) as count FROM correrias').get();
    if (correriaCount.count === 0) {
        console.log('📅 Creando correrias de prueba...');
        
        const insertCorreria = db.prepare(`
            INSERT INTO correrias (id, name, year, active)
            VALUES (?, ?, ?, 1)
        `);

        insertCorreria.run('c1', 'Madres', '2025');
        insertCorreria.run('c2', 'Madres', '2024');

        console.log('   ✅ Correría creada: c1 - Madres 2025');
        console.log('   ✅ Correría creada: c2 - Madres 2024');
    }

    console.log('\n✅ Base de datos inicializada correctamente!');
    console.log('📍 Ubicación:', DB_PATH);
    console.log('');

    // Cerrar conexión
    db.close();

    return DB_PATH;
}

/**
 * Obtener instancia de la base de datos
 * Usa esto en otros módulos para acceder a la BD
 */
function getDatabase() {
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    return db;
}

/**
 * Generar ID único
 * Usa timestamp + random para generar IDs únicos
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Exportar funciones
module.exports = {
    initDatabase,
    getDatabase,
    generateId,
    DB_PATH
};
