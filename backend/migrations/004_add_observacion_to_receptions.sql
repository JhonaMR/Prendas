-- migrations/004_add_observacion_to_receptions.sql
-- Descripción: Agregar columna observacion a tabla receptions
-- Fecha: 2026-03-24
-- Aplicar en: inventory_plow, inventory_melas, inventory_dev (o nombre local de dev)

-- ==================== UP ====================
ALTER TABLE receptions 
ADD COLUMN IF NOT EXISTS observacion TEXT DEFAULT NULL;

-- ==================== DOWN ====================
-- ALTER TABLE receptions DROP COLUMN observacion;
