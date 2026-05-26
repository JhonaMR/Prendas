-- migrations/024_create_fichas_estampacion.sql
-- Descripción: create_fichas_estampacion
-- Fecha: 2026-05-26
-- Autor: Luis

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.fichas_estampacion (
    id                  varchar(50)  PRIMARY KEY,
    referencia          varchar(100) NOT NULL,

    -- Identificación y Fechas
    fecha_envio         varchar(50),
    fecha_entrega       varchar(50),

    -- Corte y cantidad (se arrastra del módulo Registro de Corte / corte_registros)
    n_corte             varchar(100),
    cantidad            varchar(50),

    -- Responsable y Descripción básica
    ficha_realizada_por varchar(255),
    descripcion         text,

    -- Precios (JSONB dinámico)
    -- Formato: [{"concepto": "ESTAMPADO", "valor": "1200"}, {"concepto": "PEGADA APLIQUE", "valor": "500"}]
    precios             jsonb           NOT NULL DEFAULT '[]'::jsonb,

    -- Foto seleccionada (Frente)
    foto_seleccionada   smallint        NOT NULL DEFAULT 1,

    -- Observaciones (JSONB dinámico)
    -- Formato: ["CAQUI 15 MTS", "PISTACHO 15 MTS", "TELA MALLATEX"]
    observaciones       jsonb           NOT NULL DEFAULT '[]'::jsonb,

    -- Responsable (Ej: GLOBLO)
    responsable         varchar(255),

    -- Pintas activo/inactivo toggle
    pintas_activo       boolean         NOT NULL DEFAULT true,

    -- Pintas de estampado (JSONB)
    -- Formato: [{"label": "FLORES ROSA", "fotoPath": "/ruta.jpg", "isFromFicha": true, "fotoNum": 1}]
    pintas              jsonb           NOT NULL DEFAULT '[]'::jsonb,

    -- Combinación de colores (JSONB dinámico de celdas)
    -- Formato: un array de filas donde cada fila tiene celdas para las 6 columnas: [["Celda1", "Celda2", ...], ...]
    combinacion_colores jsonb           NOT NULL DEFAULT '[]'::jsonb,

    -- Auditoría
    created_by          varchar(255),
    created_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fichas_estampacion_referencia
    ON public.fichas_estampacion(referencia);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS public.idx_fichas_estampacion_referencia;
-- DROP TABLE IF EXISTS public.fichas_estampacion;
