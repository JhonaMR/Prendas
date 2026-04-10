-- migrations/008_create_transporte_tables.sql
-- Descripción: Crear tablas del módulo de Control de Transporte
--              transportistas: conductores con su color indicador
--              talleres: talleres registrados para autocompletar
--              rutas_transporte: ruta de un transportista en un día
--              rutas_transporte_items: registros individuales de cada ruta
-- Fecha: 2026-04-10

-- ==================== UP ====================

-- ----------------------------------------------------------------------------
-- 1. transportistas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transportistas (
    id          VARCHAR(50)  PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    celular     VARCHAR(50)  NOT NULL DEFAULT '',
    picoyplaca  VARCHAR(50)  NOT NULL DEFAULT '',
    color_key   VARCHAR(30)  NOT NULL DEFAULT 'red',
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transportistas_nombre ON public.transportistas(LOWER(nombre));

-- ----------------------------------------------------------------------------
-- 2. talleres
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.talleres (
    id          VARCHAR(50)  PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    celular     VARCHAR(50)  NOT NULL DEFAULT '',
    direccion   VARCHAR(255) NOT NULL DEFAULT '',
    sector      VARCHAR(100) NOT NULL DEFAULT '',
    estado      VARCHAR(20)  NOT NULL DEFAULT 'activo',
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_talleres_nombre ON public.talleres(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_talleres_estado ON public.talleres(estado);

-- ----------------------------------------------------------------------------
-- 3. rutas_transporte
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rutas_transporte (
    id                VARCHAR(50) PRIMARY KEY,
    fecha             DATE        NOT NULL,
    transportista_id  VARCHAR(50) NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_transporte_fecha          ON public.rutas_transporte(fecha);
CREATE INDEX IF NOT EXISTS idx_rutas_transporte_transportista  ON public.rutas_transporte(transportista_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rutas_transporte_unique  ON public.rutas_transporte(fecha, transportista_id);

-- ----------------------------------------------------------------------------
-- 4. rutas_transporte_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rutas_transporte_items (
    id          VARCHAR(50)  PRIMARY KEY,
    ruta_id     VARCHAR(50)  NOT NULL REFERENCES public.rutas_transporte(id) ON DELETE CASCADE,
    taller      VARCHAR(255) NOT NULL DEFAULT '',
    celular     VARCHAR(50)  NOT NULL DEFAULT '',
    direccion   VARCHAR(255) NOT NULL DEFAULT '',
    sector      VARCHAR(100) NOT NULL DEFAULT '',
    detalle     VARCHAR(500) NOT NULL DEFAULT '',
    servicio    VARCHAR(255) NOT NULL DEFAULT '',
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rutas_transporte_items_ruta ON public.rutas_transporte_items(ruta_id);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_rutas_transporte_items_ruta;
-- DROP TABLE IF EXISTS public.rutas_transporte_items;
-- DROP INDEX IF EXISTS idx_rutas_transporte_unique;
-- DROP INDEX IF EXISTS idx_rutas_transporte_transportista;
-- DROP INDEX IF EXISTS idx_rutas_transporte_fecha;
-- DROP TABLE IF EXISTS public.rutas_transporte;
-- DROP INDEX IF EXISTS idx_talleres_estado;
-- DROP INDEX IF EXISTS idx_talleres_nombre;
-- DROP TABLE IF EXISTS public.talleres;
-- DROP INDEX IF EXISTS idx_transportistas_nombre;
-- DROP TABLE IF EXISTS public.transportistas;
