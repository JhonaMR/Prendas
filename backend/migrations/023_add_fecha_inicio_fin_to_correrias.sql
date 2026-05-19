-- Migration: Add fecha_inicio and fecha_fin columns to correrias table
-- Description: Adds start and end date columns to track correria periods
-- Fecha: 2026-05-19

-- ==================== UP ====================
ALTER TABLE public.correrias
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS fecha_fin DATE;

-- Add comment to columns for documentation
COMMENT ON COLUMN public.correrias.fecha_inicio IS 'Fecha de inicio de la correría';
COMMENT ON COLUMN public.correrias.fecha_fin IS 'Fecha de fin de la correría';

-- ==================== DOWN ====================
-- ALTER TABLE public.correrias DROP COLUMN IF EXISTS fecha_inicio;
-- ALTER TABLE public.correrias DROP COLUMN IF EXISTS fecha_fin;
