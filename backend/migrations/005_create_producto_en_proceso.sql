-- migrations/005_create_producto_en_proceso.sql
-- Descripción: Crear tabla producto_en_proceso para control de lotes enviados a confeccionistas
-- Fecha: 2026-03-30

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.producto_en_proceso (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    confeccionista   varchar(255) NOT NULL DEFAULT '',
    remision         varchar(100) NOT NULL DEFAULT '',
    ref              varchar(100) NOT NULL DEFAULT '',
    salida           numeric(10,2),
    fecha_remision   date,
    entrega          numeric(10,2),
    segundas         numeric(10,2),
    vta              numeric(10,2),
    cobrado          numeric(10,2),
    incompleto       numeric(10,2),
    fecha_llegada    date,
    talegos_salida   numeric(10,2),
    talegos_entrega  numeric(10,2),
    muestras_salida  numeric(10,2),
    muestras_entrega numeric(10,2),
    row_highlight    varchar(10),
    cell_highlights  jsonb NOT NULL DEFAULT '{}'::jsonb,
    cell_comments    jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_by       varchar(255),
    created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT producto_en_proceso_row_highlight_check
        CHECK (row_highlight IN ('yellow', 'red') OR row_highlight IS NULL)
);

-- Índices para los filtros más usados en la vista
CREATE INDEX IF NOT EXISTS idx_pep_confeccionista ON public.producto_en_proceso(LOWER(confeccionista));
CREATE INDEX IF NOT EXISTS idx_pep_ref            ON public.producto_en_proceso(ref);
CREATE INDEX IF NOT EXISTS idx_pep_remision       ON public.producto_en_proceso(remision);
CREATE INDEX IF NOT EXISTS idx_pep_fecha_remision ON public.producto_en_proceso(fecha_remision);
CREATE INDEX IF NOT EXISTS idx_pep_fecha_llegada  ON public.producto_en_proceso(fecha_llegada);
CREATE INDEX IF NOT EXISTS idx_pep_pendientes     ON public.producto_en_proceso(fecha_llegada) WHERE fecha_llegada IS NULL;
CREATE INDEX IF NOT EXISTS idx_pep_conf_llegada   ON public.producto_en_proceso(confeccionista, fecha_llegada);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_pep_conf_llegada;
-- DROP INDEX IF EXISTS idx_pep_pendientes;
-- DROP INDEX IF EXISTS idx_pep_fecha_llegada;
-- DROP INDEX IF EXISTS idx_pep_fecha_remision;
-- DROP INDEX IF EXISTS idx_pep_remision;
-- DROP INDEX IF EXISTS idx_pep_ref;
-- DROP INDEX IF EXISTS idx_pep_confeccionista;
-- DROP TABLE IF EXISTS public.producto_en_proceso;
