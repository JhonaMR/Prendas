#!/usr/bin/env node

/**
 * Script para crear las tablas del sistema de fichas
 * Ejecutar: node scripts/setup-fichas-db.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'inventory'
});

const SQL = `
-- Diseñadoras
CREATE TABLE IF NOT EXISTS disenadoras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20),
    telefono VARCHAR(20),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Diseño
CREATE TABLE IF NOT EXISTS fichas_diseno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    disenadora_id UUID REFERENCES disenadoras(id),
    descripcion TEXT,
    marca VARCHAR(255),
    novedad VARCHAR(255),
    muestra_1 VARCHAR(255),
    muestra_2 VARCHAR(255),
    observaciones TEXT,
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_total DECIMAL(12,2) DEFAULT 0,
    importada BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Costo
CREATE TABLE IF NOT EXISTS fichas_costo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    ficha_diseno_id UUID REFERENCES fichas_diseno(id),
    descripcion TEXT,
    marca VARCHAR(255),
    novedad VARCHAR(255),
    muestra_1 VARCHAR(255),
    muestra_2 VARCHAR(255),
    observaciones TEXT,
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_total DECIMAL(12,2) DEFAULT 0,
    precio_venta DECIMAL(12,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 49,
    margen_ganancia DECIMAL(12,2) DEFAULT 0,
    costo_contabilizar DECIMAL(12,2) DEFAULT 0,
    desc_0_precio DECIMAL(12,2) DEFAULT 0,
    desc_0_rent DECIMAL(5,2) DEFAULT 0,
    desc_5_precio DECIMAL(12,2) DEFAULT 0,
    desc_5_rent DECIMAL(5,2) DEFAULT 0,
    desc_10_precio DECIMAL(12,2) DEFAULT 0,
    desc_10_rent DECIMAL(5,2) DEFAULT 0,
    desc_15_precio DECIMAL(12,2) DEFAULT 0,
    desc_15_rent DECIMAL(5,2) DEFAULT 0,
    cantidad_total_cortada INT DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fichas de Cortes
CREATE TABLE IF NOT EXISTS fichas_cortes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ficha_costo_id UUID NOT NULL REFERENCES fichas_costo(id) ON DELETE CASCADE,
    numero_corte INT NOT NULL,
    fecha_corte DATE,
    cantidad_cortada INT DEFAULT 0,
    materia_prima JSONB DEFAULT '[]',
    mano_obra JSONB DEFAULT '[]',
    insumos_directos JSONB DEFAULT '[]',
    insumos_indirectos JSONB DEFAULT '[]',
    provisiones JSONB DEFAULT '[]',
    total_materia_prima DECIMAL(12,2) DEFAULT 0,
    total_mano_obra DECIMAL(12,2) DEFAULT 0,
    total_insumos_directos DECIMAL(12,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(12,2) DEFAULT 0,
    total_provisiones DECIMAL(12,2) DEFAULT 0,
    costo_real DECIMAL(12,2) DEFAULT 0,
    precio_venta DECIMAL(12,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 0,
    costo_proyectado DECIMAL(12,2) DEFAULT 0,
    diferencia DECIMAL(12,2) DEFAULT 0,
    margen_utilidad DECIMAL(5,2) DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ficha_costo_id, numero_corte)
);

-- Maletas
CREATE TABLE IF NOT EXISTS maletas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    correria_id UUID REFERENCES correrias(id),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maletas Referencias
CREATE TABLE IF NOT EXISTS maletas_referencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maleta_id UUID NOT NULL REFERENCES maletas(id) ON DELETE CASCADE,
    referencia VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(maleta_id, referencia)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_referencia ON fichas_diseno(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_costo_referencia ON fichas_costo(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_ficha_costo ON fichas_cortes(ficha_costo_id);
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_maleta ON maletas_referencias(maleta_id);
`;

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('🔄 Conectando a la base de datos...');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
        console.log(`   BD: ${process.env.DB_NAME || 'inventory'}`);
        console.log('');

        console.log('📊 Creando tablas del sistema de fichas...');
        await client.query(SQL);
        
        console.log('✅ Tablas creadas exitosamente');
        console.log('');

        // Verificar tablas creadas
        console.log('🔍 Verificando tablas creadas...');
        const result = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('disenadoras', 'fichas_diseno', 'fichas_costo', 'fichas_cortes', 'maletas', 'maletas_referencias')
            ORDER BY table_name;
        `);

        console.log('');
        console.log('📋 Tablas creadas:');
        result.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        if (result.rows.length === 6) {
            console.log('');
            console.log('✅ ¡TODAS LAS TABLAS CREADAS CORRECTAMENTE!');
            console.log('');
            console.log('🚀 El sistema de fichas está listo para usar.');
        } else {
            console.log('');
            console.log('⚠️ Se crearon ' + result.rows.length + ' de 6 tablas esperadas');
        }

        client.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error creando tablas:', error.message);
        console.error('');
        console.error('Detalles del error:');
        console.error(error);
        client.release();
        await pool.end();
        process.exit(1);
    }
}

setupDatabase();
