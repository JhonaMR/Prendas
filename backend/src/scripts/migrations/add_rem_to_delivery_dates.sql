-- Migración: Agregar columna REM a delivery_dates
-- Ejecutar en: inventory_plow, inventory_melas, inventory_dev

ALTER TABLE delivery_dates
ADD COLUMN IF NOT EXISTS rem NUMERIC NULL;
