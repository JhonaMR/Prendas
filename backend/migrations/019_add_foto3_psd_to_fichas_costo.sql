-- migrations/019_add_foto3_psd_to_fichas_costo.sql
-- Descripcion: Agrega foto_3 y archivo_psd a fichas_costo
--              Se copian desde fichas_diseno al momento de importar

-- ==================== UP ====================

ALTER TABLE public.fichas_costo
    ADD COLUMN IF NOT EXISTS foto_3      varchar(500),
    ADD COLUMN IF NOT EXISTS archivo_psd varchar(500);

COMMENT ON COLUMN public.fichas_costo.foto_3      IS 'Tercera foto (copiada de fichas_diseno al importar)';
COMMENT ON COLUMN public.fichas_costo.archivo_psd IS 'Ruta al archivo de molde DXF/SVG (copiada de fichas_diseno al importar)';

-- ==================== DOWN ====================
-- ALTER TABLE public.fichas_costo DROP COLUMN IF EXISTS foto_3;
-- ALTER TABLE public.fichas_costo DROP COLUMN IF EXISTS archivo_psd;
