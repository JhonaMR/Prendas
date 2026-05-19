-- Migration: Add reception columns to maletas table
-- Description: Add columns to track maleta reception status and details

-- ==================== UP ====================

ALTER TABLE public.maletas
ADD COLUMN estado character varying(50) DEFAULT 'enviada',
ADD COLUMN recibido_por character varying(255),
ADD COLUMN fecha_recepcion timestamp without time zone,
ADD COLUMN num_referencias_recibidas integer DEFAULT 0;

-- Add comment to explain the estado column values
COMMENT ON COLUMN public.maletas.estado IS 'Estado de la maleta: enviada, recibida';
COMMENT ON COLUMN public.maletas.recibido_por IS 'Nombre de la persona que recibió la maleta';
COMMENT ON COLUMN public.maletas.fecha_recepcion IS 'Fecha y hora en que se recibió la maleta';
COMMENT ON COLUMN public.maletas.num_referencias_recibidas IS 'Cantidad de referencias recibidas en la maleta';

-- ==================== DOWN ====================
-- ALTER TABLE public.maletas
-- DROP COLUMN IF EXISTS estado,
-- DROP COLUMN IF EXISTS recibido_por,
-- DROP COLUMN IF EXISTS fecha_recepcion,
-- DROP COLUMN IF EXISTS num_referencias_recibidas;
