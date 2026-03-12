-- Script para agregar columnas de porcentajes a la tabla orders
-- Ejecutar este script para actualizar la base de datos existente

-- Agregar columnas si no existen
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS porcentaje_oficial numeric(5,2),
ADD COLUMN IF NOT EXISTS porcentaje_remision numeric(5,2);

-- Actualizar registros existentes con valor 0
UPDATE public.orders 
SET porcentaje_oficial = 0, porcentaje_remision = 0
WHERE porcentaje_oficial IS NULL OR porcentaje_remision IS NULL;

-- Verificar los cambios
SELECT id, client_id, porcentaje_oficial, porcentaje_remision 
FROM public.orders 
LIMIT 10;
