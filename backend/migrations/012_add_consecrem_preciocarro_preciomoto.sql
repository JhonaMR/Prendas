-- migrations/012_add_consecrem_preciocarro_preciomoto.sql
-- Descripción: Agregar columna ConsecRem a confeccionistas,
--              y columnas PrecioCarro y PrecioMoto a talleres
-- Fecha: 2026-04-20

-- ==================== UP ====================

ALTER TABLE public.confeccionistas
    ADD COLUMN IF NOT EXISTS "ConsecRem" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.talleres
    ADD COLUMN IF NOT EXISTS "PrecioCarro" VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS "PrecioMoto"  VARCHAR(100) NOT NULL DEFAULT '';

-- ==================== DOWN ====================
-- ALTER TABLE public.talleres DROP COLUMN IF EXISTS "PrecioMoto";
-- ALTER TABLE public.talleres DROP COLUMN IF EXISTS "PrecioCarro";
-- ALTER TABLE public.confeccionistas DROP COLUMN IF EXISTS "ConsecRem";
