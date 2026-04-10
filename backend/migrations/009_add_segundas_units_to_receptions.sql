-- migrations/009_add_segundas_units_to_receptions.sql
-- Descripción: Agregar columna segundas_units a tabla receptions para registrar cantidad de segundas
-- Fecha: 2026-04-10
-- Aplicar en: inventory_plow, inventory_melas, inventory_dev (o nombre local de dev)

-- ==================== UP ====================
ALTER TABLE receptions
ADD COLUMN IF NOT EXISTS segundas_units INTEGER DEFAULT 0;

-- ==================== DOWN ====================
-- ALTER TABLE receptions DROP COLUMN segundas_units;
