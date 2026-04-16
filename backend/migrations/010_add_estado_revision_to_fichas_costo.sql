-- migrations/010_add_estado_revision_to_fichas_costo.sql
-- Descripción: Agregar columna estado_revision a fichas_costo para indicador visual de revisión (rojo, verde, morado)
-- Fecha: 2026-04-16
-- Aplicar en: inventory_plow, inventory_melas, inventory_dev (o nombre local de dev)

-- ==================== UP ====================
ALTER TABLE fichas_costo
ADD COLUMN IF NOT EXISTS estado_revision VARCHAR(10) DEFAULT NULL;

-- ==================== DOWN ====================
-- ALTER TABLE fichas_costo DROP COLUMN estado_revision;
