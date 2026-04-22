-- migrations/013_create_corte_registros.sql
-- Descripción: Crear tabla corte_registros para control de fichas de corte
-- Fecha: 2026-04-22

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.corte_registros (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ficha      varchar(50) NOT NULL UNIQUE,
    fecha_corte       date NOT NULL,
    referencia        varchar(50) NOT NULL,
    descripcion       varchar(255),
    cantidad_cortada  integer NOT NULL DEFAULT 0,
    created_by        varchar(255),
    updated_by        varchar(255),
    created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_corte_referencia    ON public.corte_registros(referencia);
CREATE INDEX IF NOT EXISTS idx_corte_numero_ficha  ON public.corte_registros(numero_ficha);
CREATE INDEX IF NOT EXISTS idx_corte_fecha_corte   ON public.corte_registros(fecha_corte);
CREATE INDEX IF NOT EXISTS idx_corte_created_at    ON public.corte_registros(created_at DESC);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_corte_created_at;
-- DROP INDEX IF EXISTS idx_corte_fecha_corte;
-- DROP INDEX IF EXISTS idx_corte_numero_ficha;
-- DROP INDEX IF EXISTS idx_corte_referencia;
-- DROP TABLE IF EXISTS public.corte_registros;
