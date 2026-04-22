-- ============================================
-- SCRIPT SQL: Actualizar rutas de fotos para Plow
-- Migra rutas de /images/references/ a /images/references/Plow/
-- ============================================

-- Ver las rutas actuales (opcional - para verificar antes)
-- SELECT referencia, foto_1, foto_2 
-- FROM fichas_diseno 
-- WHERE foto_1 IS NOT NULL OR foto_2 IS NOT NULL;

-- Actualizar foto_1: cambiar /images/references/ por /images/references/Plow/
UPDATE fichas_diseno 
SET foto_1 = REPLACE(foto_1, '/images/references/', '/images/references/Plow/')
WHERE foto_1 IS NOT NULL 
  AND foto_1 LIKE '/images/references/%'
  AND foto_1 NOT LIKE '/images/references/Plow/%'
  AND foto_1 NOT LIKE '/images/references/Melas/%';

-- Actualizar foto_2: cambiar /images/references/ por /images/references/Plow/
UPDATE fichas_diseno 
SET foto_2 = REPLACE(foto_2, '/images/references/', '/images/references/Plow/')
WHERE foto_2 IS NOT NULL 
  AND foto_2 LIKE '/images/references/%'
  AND foto_2 NOT LIKE '/images/references/Plow/%'
  AND foto_2 NOT LIKE '/images/references/Melas/%';

-- Ver el resultado (opcional - para verificar después)
-- SELECT referencia, foto_1, foto_2 
-- FROM fichas_diseno 
-- WHERE foto_1 IS NOT NULL OR foto_2 IS NOT NULL;