-- migrations/002_add_checked_by_column_to_dispatches_melas.sql
-- Descripción: add_checked_by_column_to_dispatches_melas
-- Fecha: 2026-03-17
-- Autor: AUXILIAR2

-- ==================== UP ====================
-- Agregar columna checked_by a la tabla dispatches en Melas
-- Esta columna falta en Melas pero existe en Plow
-- Se usa para registrar quién revisó el despacho

ALTER TABLE public.dispatches 
ADD COLUMN checked_by character varying(255) DEFAULT '0'::character varying;


-- ==================== DOWN ====================
-- Revertir: Eliminar la columna checked_by

ALTER TABLE public.dispatches 
DROP COLUMN checked_by;
