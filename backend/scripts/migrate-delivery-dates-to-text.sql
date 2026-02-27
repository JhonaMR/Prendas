-- ============================================================================
-- MIGRACIÓN: Cambiar delivery_dates para permitir confeccionista_id y reference_id como texto libre
-- ============================================================================
-- Este script remueve las restricciones de clave foránea para permitir valores de texto libre

-- 1. Remover la restricción de clave foránea en confeccionista_id
ALTER TABLE public.delivery_dates 
DROP CONSTRAINT IF EXISTS delivery_dates_confeccionista_id_fkey;

-- 2. Remover la restricción de clave foránea en reference_id (si existe)
ALTER TABLE public.delivery_dates 
DROP CONSTRAINT IF EXISTS delivery_dates_reference_id_fkey;

-- 3. Cambiar confeccionista_id a NOT NULL (ya que siempre debe tener valor)
ALTER TABLE public.delivery_dates 
ALTER COLUMN confeccionista_id SET NOT NULL;

-- 4. Cambiar reference_id a NOT NULL (ya que siempre debe tener valor)
ALTER TABLE public.delivery_dates 
ALTER COLUMN reference_id SET NOT NULL;

-- ============================================================================
-- Verificación
-- ============================================================================
-- SELECT constraint_name, table_name, column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name = 'delivery_dates';
