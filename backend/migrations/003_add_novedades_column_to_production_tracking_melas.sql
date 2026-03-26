-- migrations/003_add_novedades_column_to_production_tracking_melas.sql
-- Descripción: add_novedades_column_to_production_tracking_melas
-- Fecha: 2026-03-17
-- Autor: AUXILIAR2

-- ==================== UP ====================
-- Agregar columna novedades a production_tracking en Melas
-- Esta columna falta en Melas pero existe en Plow
-- Se usa para registrar novedades por referencia en la vista de Pedidos

ALTER TABLE public.production_tracking
ADD COLUMN novedades text;

-- Ejemplo: Crear tabla
-- CREATE TABLE nueva_tabla (
--   id SERIAL PRIMARY KEY,
--   nombre VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Ejemplo: Crear índice
-- CREATE INDEX idx_tabla_columna ON tabla_nombre(columna);

-- Ejemplo: Modificar datos
-- UPDATE tabla_nombre SET columna = 'valor' WHERE condicion;


-- ==================== DOWN ====================
-- Revertir: Eliminar la columna novedades

ALTER TABLE public.production_tracking
DROP COLUMN novedades;

-- Ejemplo: Eliminar columna
-- ALTER TABLE tabla_nombre DROP COLUMN nueva_columna;

-- Ejemplo: Eliminar tabla
-- DROP TABLE nueva_tabla;

-- Ejemplo: Eliminar índice
-- DROP INDEX idx_tabla_columna;

-- Ejemplo: Revertir datos
-- UPDATE tabla_nombre SET columna = 'valor_anterior' WHERE condicion;
