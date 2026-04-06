-- migrations/006_create_pago_lotes_config.sql
-- Descripción: Crear tabla de configuración para el módulo de cálculo y pago de lotes
--              Almacena los porcentajes OF/ML y la base de retención en la fuente
-- Fecha: 2026-04-06

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.pago_lotes_config (
    id          serial PRIMARY KEY,
    clave       varchar(100) NOT NULL UNIQUE,
    valor       numeric(15,2) NOT NULL,
    descripcion varchar(255),
    updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by  varchar(255)
);

-- Valores por defecto
INSERT INTO public.pago_lotes_config (clave, valor, descripcion) VALUES
    ('pct_of',    40,      'Porcentaje del pago que va al banco OF'),
    ('pct_ml',    60,      'Porcentaje del pago que va al banco ML'),
    ('base_rte_fte', 105000, 'Base mínima para aplicar retención en la fuente (6%)')
ON CONFLICT (clave) DO NOTHING;

-- Índice por clave para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pago_lotes_config_clave ON public.pago_lotes_config(clave);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_pago_lotes_config_clave;
-- DROP TABLE IF EXISTS public.pago_lotes_config;
