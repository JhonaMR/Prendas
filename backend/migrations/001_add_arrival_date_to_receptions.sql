-- migrations/002_add_arrival_date_to_receptions.sql
-- Descripción: Agregar columna fecha_llegada a tabla receptions
-- Fecha: 2026-03-17
-- Autor: Sistema

-- ==================== UP ====================
-- Agregar columna arrival_date a la tabla receptions
ALTER TABLE receptions 
ADD COLUMN arrival_date DATE DEFAULT '2026-01-01' NOT NULL;

-- Crear índice para búsquedas por fecha de llegada
CREATE INDEX idx_receptions_arrival_date ON receptions(arrival_date);

-- ==================== DOWN ====================
-- DROP INDEX idx_receptions_arrival_date;
-- ALTER TABLE receptions DROP COLUMN arrival_date;
