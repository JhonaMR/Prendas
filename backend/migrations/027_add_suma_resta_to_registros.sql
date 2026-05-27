-- migrations/027_add_suma_resta_to_registros.sql
-- Descripción: add_suma_resta_to_registros
-- Fecha: 2026-05-27
-- Autor: AUXILIAR2

-- ==================== UP ====================
ALTER TABLE public.asistencia_registros ADD COLUMN IF NOT EXISTS suma_resta NUMERIC(5,2) NOT NULL DEFAULT 0.00;

-- Poblar registros existentes con la regla por defecto
UPDATE public.asistencia_registros
SET suma_resta = CASE
  WHEN balance < 0 OR balance > 0.50 THEN balance
  ELSE 0.00
END;

-- ==================== DOWN ====================
-- ALTER TABLE public.asistencia_registros DROP COLUMN IF EXISTS suma_resta;

