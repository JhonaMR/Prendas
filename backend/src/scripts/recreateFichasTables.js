/**
 * 📋 SCRIPT: Recrear tablas de Fichas
 * 
 * Elimina y recrea las tablas necesarias para el sistema de fichas
 */

require('dotenv').config();
const postgres = require('../config/postgres');
const configurationManager = require('../config/configurationManager');

async function recreateFichasTables() {
  try {
    console.log('🔧 Inicializando configuración...');
    await configurationManager.initializeConfiguration();
    
    console.log('🔧 Inicializando pool de conexiones...');
    await postgres.initPoolWithFallback();
    
    const db = postgres.getPool();
    
    console.log('🗑️  Eliminando tablas existentes...');
    
    // Drop tables in reverse order of dependencies
    await db.query('DROP TABLE IF EXISTS cortes CASCADE;');
    console.log('✅ Tabla cortes eliminada');
    
    await db.query('DROP TABLE IF EXISTS maletas CASCADE;');
    console.log('✅ Tabla maletas eliminada');
    
    await db.query('DROP TABLE IF EXISTS fichas_costo CASCADE;');
    console.log('✅ Tabla fichas_costo eliminada');
    
    await db.query('DROP TABLE IF EXISTS fichas_diseno CASCADE;');
    console.log('✅ Tabla fichas_diseno eliminada');
    
    await db.query('DROP TABLE IF EXISTS disenadoras CASCADE;');
    console.log('✅ Tabla disenadoras eliminada');
    
    console.log('\n📋 Creando tablas de fichas...');
    
    // Tabla de diseñadoras
    await db.query(`
      CREATE TABLE IF NOT EXISTS disenadoras (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        cedula VARCHAR(20),
        telefono VARCHAR(20),
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla disenadoras creada');
    
    // Tabla de fichas de diseño
    await db.query(`
      CREATE TABLE IF NOT EXISTS fichas_diseno (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referencia VARCHAR(50) NOT NULL UNIQUE,
        disenadora_id UUID REFERENCES disenadoras(id),
        descripcion TEXT,
        marca VARCHAR(255),
        novedad VARCHAR(255),
        muestra1 VARCHAR(255),
        muestra2 VARCHAR(255),
        observaciones TEXT,
        foto1 VARCHAR(500),
        foto2 VARCHAR(500),
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
    `);
    console.log('✅ Tabla fichas_diseno creada');
    
    // Tabla de fichas de costo
    await db.query(`
      CREATE TABLE IF NOT EXISTS fichas_costo (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referencia VARCHAR(50) NOT NULL UNIQUE,
        ficha_diseno_id UUID REFERENCES fichas_diseno(id),
        descripcion TEXT,
        marca VARCHAR(255),
        novedad VARCHAR(255),
        muestra1 VARCHAR(255),
        muestra2 VARCHAR(255),
        observaciones TEXT,
        foto1 VARCHAR(500),
        foto2 VARCHAR(500),
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
        rentabilidad DECIMAL(5,2) DEFAULT 0,
        margen_ganancia DECIMAL(12,2) DEFAULT 0,
        costo_contabilizar DECIMAL(12,2) DEFAULT 0,
        desc0_precio DECIMAL(12,2) DEFAULT 0,
        desc0_rent DECIMAL(5,2) DEFAULT 0,
        desc5_precio DECIMAL(12,2) DEFAULT 0,
        desc5_rent DECIMAL(5,2) DEFAULT 0,
        desc10_precio DECIMAL(12,2) DEFAULT 0,
        desc10_rent DECIMAL(5,2) DEFAULT 0,
        desc15_precio DECIMAL(12,2) DEFAULT 0,
        desc15_rent DECIMAL(5,2) DEFAULT 0,
        cantidad_total_cortada INT DEFAULT 0,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla fichas_costo creada');
    
    // Tabla de cortes
    await db.query(`
      CREATE TABLE IF NOT EXISTS cortes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ficha_costo_id UUID NOT NULL REFERENCES fichas_costo(id),
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
    `);
    console.log('✅ Tabla cortes creada');
    
    // Tabla de maletas
    await db.query(`
      CREATE TABLE IF NOT EXISTS maletas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        correria_id UUID,
        referencias JSONB DEFAULT '[]',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla maletas creada');
    
    // Crear índices
    await db.query(`CREATE INDEX IF NOT EXISTS idx_fichas_diseno_referencia ON fichas_diseno(referencia);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_fichas_costo_referencia ON fichas_costo(referencia);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_cortes_ficha_costo ON cortes(ficha_costo_id);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_maletas_nombre ON maletas(nombre);`);
    
    console.log('✅ Índices creados');
    
    console.log('\n✅ Todas las tablas de fichas han sido recreadas exitosamente');
    
    await postgres.closePool();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error recreando tablas:', error);
    process.exit(1);
  }
}

recreateFichasTables();
