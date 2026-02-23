-- ============================================
-- SISTEMA DE FICHAS DE DISEÑO Y COSTO
-- PostgreSQL Schema
-- ============================================

-- ============ 1. EXTENSIONES ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ 2. TIPOS ENUM ============
-- Agregar nuevos roles de usuario
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'general', 'disenadora', 'observador');
    ELSE
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'disenadora';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'observador';
    END IF;
END $$;

-- ============ 3. TABLA DISEÑADORAS ============
CREATE TABLE IF NOT EXISTS disenadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50),
    telefono VARCHAR(50),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO disenadoras (nombre, cedula, telefono) 
VALUES 
    ('MARTHA RAMIREZ', '1234567890', '3001234567'),
    ('JACKELINE PEREA', '0987654321', '3109876543')
ON CONFLICT DO NOTHING;

-- ============ 4. TABLA FICHAS DE DISEÑO ============
CREATE TABLE IF NOT EXISTS fichas_diseno (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    disenadora_id UUID REFERENCES disenadoras(id),
    
    -- Metadata
    descripcion TEXT,
    marca VARCHAR(255),
    novedad TEXT,
    muestra_1 VARCHAR(100),
    muestra_2 VARCHAR(100),
    observaciones TEXT,
    
    -- Fotos (rutas relativas)
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    
    -- Secciones en JSONB (array de objetos)
    -- Estructura: [{ concepto, tipo, um, vlr_unit, cant, total }]
    materia_prima JSONB DEFAULT '[]'::jsonb,
    mano_obra JSONB DEFAULT '[]'::jsonb,
    insumos_directos JSONB DEFAULT '[]'::jsonb,
    insumos_indirectos JSONB DEFAULT '[]'::jsonb,
    provisiones JSONB DEFAULT '[]'::jsonb,
    
    -- Totales calculados
    total_materia_prima DECIMAL(10,2) DEFAULT 0,
    total_mano_obra DECIMAL(10,2) DEFAULT 0,
    total_insumos_directos DECIMAL(10,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(10,2) DEFAULT 0,
    total_provisiones DECIMAL(10,2) DEFAULT 0,
    costo_total DECIMAL(10,2) DEFAULT 0,
    
    -- Control
    importada BOOLEAN DEFAULT false,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ 5. TABLA FICHAS DE COSTO ============
CREATE TABLE IF NOT EXISTS fichas_costo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referencia VARCHAR(50) UNIQUE NOT NULL,
    ficha_diseno_id UUID REFERENCES fichas_diseno(id),
    
    -- Metadata (duplicado de diseño)
    descripcion TEXT,
    marca VARCHAR(255),
    novedad TEXT,
    muestra_1 VARCHAR(100),
    muestra_2 VARCHAR(100),
    observaciones TEXT,
    
    foto_1 VARCHAR(500),
    foto_2 VARCHAR(500),
    
    -- Secciones
    materia_prima JSONB DEFAULT '[]'::jsonb,
    mano_obra JSONB DEFAULT '[]'::jsonb,
    insumos_directos JSONB DEFAULT '[]'::jsonb,
    insumos_indirectos JSONB DEFAULT '[]'::jsonb,
    provisiones JSONB DEFAULT '[]'::jsonb,
    
    -- Totales
    total_materia_prima DECIMAL(10,2) DEFAULT 0,
    total_mano_obra DECIMAL(10,2) DEFAULT 0,
    total_insumos_directos DECIMAL(10,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(10,2) DEFAULT 0,
    total_provisiones DECIMAL(10,2) DEFAULT 0,
    costo_total DECIMAL(10,2) DEFAULT 0,
    
    -- ADICIONALES de fichas_costo
    precio_venta DECIMAL(10,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 0,
    margen_ganancia DECIMAL(10,2) DEFAULT 0,
    costo_contabilizar DECIMAL(10,2) DEFAULT 0,
    
    -- Descuentos (calculados automáticamente)
    desc_0_precio DECIMAL(10,2) DEFAULT 0,
    desc_0_rent DECIMAL(5,2) DEFAULT 0,
    desc_5_precio DECIMAL(10,2) DEFAULT 0,
    desc_5_rent DECIMAL(5,2) DEFAULT 0,
    desc_10_precio DECIMAL(10,2) DEFAULT 0,
    desc_10_rent DECIMAL(5,2) DEFAULT 0,
    desc_15_precio DECIMAL(10,2) DEFAULT 0,
    desc_15_rent DECIMAL(5,2) DEFAULT 0,
    
    -- Total cantidad cortada
    cantidad_total_cortada INTEGER DEFAULT 0,
    
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ 6. TABLA CORTES ============
CREATE TABLE IF NOT EXISTS fichas_cortes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ficha_costo_id UUID REFERENCES fichas_costo(id) ON DELETE CASCADE,
    numero_corte INTEGER NOT NULL,
    
    -- Info del corte
    fecha_corte DATE,
    cantidad_cortada INTEGER,
    
    -- Snapshot completo de la ficha en ese momento
    materia_prima JSONB DEFAULT '[]'::jsonb,
    mano_obra JSONB DEFAULT '[]'::jsonb,
    insumos_directos JSONB DEFAULT '[]'::jsonb,
    insumos_indirectos JSONB DEFAULT '[]'::jsonb,
    provisiones JSONB DEFAULT '[]'::jsonb,
    
    total_materia_prima DECIMAL(10,2) DEFAULT 0,
    total_mano_obra DECIMAL(10,2) DEFAULT 0,
    total_insumos_directos DECIMAL(10,2) DEFAULT 0,
    total_insumos_indirectos DECIMAL(10,2) DEFAULT 0,
    total_provisiones DECIMAL(10,2) DEFAULT 0,
    costo_real DECIMAL(10,2) DEFAULT 0,
    
    precio_venta DECIMAL(10,2) DEFAULT 0,
    rentabilidad DECIMAL(5,2) DEFAULT 0,
    
    -- Utilidad vs proyectado
    costo_proyectado DECIMAL(10,2) DEFAULT 0,
    diferencia DECIMAL(10,2) DEFAULT 0,
    margen_utilidad DECIMAL(5,2) DEFAULT 0,
    
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ficha_costo_id, numero_corte)
);

-- ============ 7. TABLAS MALETAS ============
CREATE TABLE IF NOT EXISTS maletas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    correria_id UUID, -- Puede ser NULL si es para referencias sin correría
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maletas_referencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maleta_id UUID REFERENCES maletas(id) ON DELETE CASCADE,
    referencia VARCHAR(50) NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(maleta_id, referencia)
);

-- ============ 8. ÍNDICES PARA PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_ref ON fichas_diseno(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_diseno_disenadora ON fichas_diseno(disenadora_id);
CREATE INDEX IF NOT EXISTS idx_fichas_costo_ref ON fichas_costo(referencia);
CREATE INDEX IF NOT EXISTS idx_fichas_costo_ficha_diseno ON fichas_costo(ficha_diseno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_ficha ON fichas_cortes(ficha_costo_id);
CREATE INDEX IF NOT EXISTS idx_fichas_cortes_numero ON fichas_cortes(ficha_costo_id, numero_corte);
CREATE INDEX IF NOT EXISTS idx_maletas_correria ON maletas(correria_id);
CREATE INDEX IF NOT EXISTS idx_maletas_ref ON maletas_referencias(maleta_id);

-- ============ 9. TRIGGERS PARA UPDATED_AT ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_disenadoras_updated_at BEFORE UPDATE ON disenadoras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_diseno_updated_at BEFORE UPDATE ON fichas_diseno
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_costo_updated_at BEFORE UPDATE ON fichas_costo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maletas_updated_at BEFORE UPDATE ON maletas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ 10. COMENTARIOS ============
COMMENT ON TABLE disenadoras IS 'Catálogo de diseñadoras que crean fichas';
COMMENT ON TABLE fichas_diseno IS 'Fichas creadas por diseñadoras (sin precio de venta)';
COMMENT ON TABLE fichas_costo IS 'Fichas importadas con cálculos de precio y rentabilidad';
COMMENT ON TABLE fichas_cortes IS 'Versiones (cortes) de fichas de costo para comparar costos reales vs proyectados';
COMMENT ON TABLE maletas IS 'Maletas de referencias para asignar a correrías';
COMMENT ON TABLE maletas_referencias IS 'Referencias incluidas en cada maleta';

-- ============ FIN DEL SCHEMA ============
