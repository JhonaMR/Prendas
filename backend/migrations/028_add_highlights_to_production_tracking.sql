-- migrations/028_add_highlights_to_production_tracking.sql
-- Descripción: add_highlights_to_production_tracking
-- Fecha: 2026-08-06
-- Autor: AUXILIAR2

-- ==================== UP ====================
ALTER TABLE public.production_tracking
ADD COLUMN IF NOT EXISTS highlight_row_color VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS highlight_cells JSONB DEFAULT '{}'::jsonb;

-- ==================== DOWN ====================
-- ALTER TABLE public.production_tracking DROP COLUMN highlight_row_color;
-- ALTER TABLE public.production_tracking DROP COLUMN highlight_cells;
