-- migrations/029_add_linea_to_fichas.sql
-- Descripción: Agregar campo linea a fichas_diseno y fichas_costo
-- Fecha: 2026-09-01
-- Autor: IA

-- ==================== UP ====================
ALTER TABLE fichas_diseno ADD COLUMN linea VARCHAR(50);
ALTER TABLE fichas_costo ADD COLUMN linea VARCHAR(50);

-- Actualizar registros existentes para que no queden nulos si se requiere (opcional, dejamos 'Elegir' por defecto en vistas antiguas)
UPDATE fichas_diseno SET linea = 'Elegir' WHERE linea IS NULL;
UPDATE fichas_costo SET linea = 'Elegir' WHERE linea IS NULL;

-- ==================== DOWN ====================
-- ALTER TABLE fichas_diseno DROP COLUMN linea;
-- ALTER TABLE fichas_costo DROP COLUMN linea;
