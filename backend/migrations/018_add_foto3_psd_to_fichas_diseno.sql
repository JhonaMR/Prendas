-- migrations/018_add_foto3_psd_to_fichas_diseno.sql
-- Descripcion: Agrega foto_3 y archivo_psd a la tabla fichas_diseno
--              foto_3: tercera imagen de referencia (igual que foto_1 y foto_2)
--              archivo_psd: ruta al archivo PSD del molde

-- ==================== UP ====================

ALTER TABLE public.fichas_diseno
    ADD COLUMN IF NOT EXISTS foto_3      varchar(500),
    ADD COLUMN IF NOT EXISTS archivo_psd varchar(500);

COMMENT ON COLUMN public.fichas_diseno.foto_3      IS 'Tercera foto de la ficha de diseno';
COMMENT ON COLUMN public.fichas_diseno.archivo_psd IS 'Ruta al archivo PSD del molde';

-- ==================== DOWN ====================
-- ALTER TABLE public.fichas_diseno DROP COLUMN IF EXISTS foto_3;
-- ALTER TABLE public.fichas_diseno DROP COLUMN IF EXISTS archivo_psd;
