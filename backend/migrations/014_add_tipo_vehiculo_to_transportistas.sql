-- migrations/014_add_tipo_vehiculo_to_transportistas.sql
-- Descripción: Agregar columna tipo_vehiculo a la tabla transportistas
-- Fecha: 2026-04-22

-- ==================== UP ====================

-- Agregar columna tipo_vehiculo a transportistas
ALTER TABLE public.transportistas 
ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20) NOT NULL DEFAULT 'carro';

-- Crear índice para tipo_vehiculo
CREATE INDEX IF NOT EXISTS idx_transportistas_tipo_vehiculo ON public.transportistas(tipo_vehiculo);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_transportistas_tipo_vehiculo;
-- ALTER TABLE public.transportistas DROP COLUMN IF EXISTS tipo_vehiculo;