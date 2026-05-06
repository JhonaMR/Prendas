-- migrations/017_add_cod_of_cod_rm_to_clients.sql
-- Descripción: Agrega columnas cod_of y cod_rm a la tabla clients.
--              cod_of se inicializa copiando el valor actual de nit.
--              cod_rm queda en NULL para llenarse manualmente.

-- ==================== UP ====================

ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS cod_of varchar(255),
    ADD COLUMN IF NOT EXISTS cod_rm varchar(255);

-- Copiar NIT → cod_of para todos los clientes existentes
UPDATE public.clients
SET cod_of = nit
WHERE cod_of IS NULL AND nit IS NOT NULL AND nit <> '';

-- ==================== DOWN ====================
-- ALTER TABLE public.clients DROP COLUMN IF EXISTS cod_rm;
-- ALTER TABLE public.clients DROP COLUMN IF EXISTS cod_of;
