-- Migration: Create maletas_referencias_recibidas table
-- Description: Track which references have been received for each maleta

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.maletas_referencias_recibidas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    maleta_id uuid NOT NULL REFERENCES public.maletas(id) ON DELETE CASCADE,
    referencia character varying(255) NOT NULL,
    recibido_por character varying(255),
    fecha_recepcion timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(maleta_id, referencia)
);

CREATE INDEX IF NOT EXISTS idx_maletas_referencias_recibidas_maleta_id ON public.maletas_referencias_recibidas(maleta_id);
CREATE INDEX IF NOT EXISTS idx_maletas_referencias_recibidas_referencia ON public.maletas_referencias_recibidas(referencia);

COMMENT ON TABLE public.maletas_referencias_recibidas IS 'Tracks which references have been received for each maleta';
COMMENT ON COLUMN public.maletas_referencias_recibidas.maleta_id IS 'Reference to the maleta';
COMMENT ON COLUMN public.maletas_referencias_recibidas.referencia IS 'Reference code that was received';
COMMENT ON COLUMN public.maletas_referencias_recibidas.recibido_por IS 'Name of person who received this reference';
COMMENT ON COLUMN public.maletas_referencias_recibidas.fecha_recepcion IS 'Date and time when reference was received';

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_maletas_referencias_recibidas_referencia;
-- DROP INDEX IF EXISTS idx_maletas_referencias_recibidas_maleta_id;
-- DROP TABLE IF EXISTS public.maletas_referencias_recibidas;
