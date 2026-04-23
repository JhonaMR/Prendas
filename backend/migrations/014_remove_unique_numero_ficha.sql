-- migrations/014_remove_unique_numero_ficha.sql
-- Descripción: Eliminar restricción UNIQUE de numero_ficha para permitir fichas duplicadas
-- Fecha: 2026-04-23

-- ==================== UP ====================

-- Eliminar la restricción UNIQUE de numero_ficha
-- Las fichas pueden repetirse para múltiples registros de corte
ALTER TABLE public.corte_registros DROP CONSTRAINT IF EXISTS corte_registros_numero_ficha_key;

-- Verificar que el índice sigue existiendo para búsquedas rápidas (sin UNIQUE)
-- El índice idx_corte_numero_ficha ya existe y seguirá funcionando

-- ==================== DOWN ====================
-- Para revertir (solo si es necesario):
-- ALTER TABLE public.corte_registros ADD CONSTRAINT corte_registros_numero_ficha_key UNIQUE (numero_ficha);