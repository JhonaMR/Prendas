-- Script para agregar columna 'inventory' a la tabla production_tracking
-- Ejecutar este script si la columna no existe

ALTER TABLE public.production_tracking
ADD COLUMN IF NOT EXISTS inventory integer DEFAULT 0;

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_production_tracking_ref_id ON public.production_tracking(ref_id);
