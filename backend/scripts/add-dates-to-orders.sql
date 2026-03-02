-- ============================================================================
-- SCRIPT: Agregar columnas de fecha a la tabla orders
-- ============================================================================
-- Este script agrega las columnas start_date y end_date a la tabla orders
-- para registrar la fecha de inicio y fin de despacho de cada pedido
-- ============================================================================

-- Agregar columnas si no existen
ALTER TABLE IF EXISTS public.orders
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_orders_start_date ON public.orders(start_date);
CREATE INDEX IF NOT EXISTS idx_orders_end_date ON public.orders(end_date);

-- Mensaje de confirmación
SELECT 'Columnas start_date y end_date agregadas a la tabla orders' AS status;
