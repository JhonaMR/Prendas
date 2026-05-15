-- migrations/020_create_fichas_confeccion.sql
-- Descripcion: Tabla para fichas tecnicas de confeccion
-- linea, marca y n_muestra se arrastran desde fichas_costo, no se duplican aqui

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.fichas_confeccion (
    id                  varchar(50)  PRIMARY KEY,
    referencia          varchar(100) NOT NULL,

    -- Identificacion
    fecha_envio         varchar(50),
    fecha_entrega       varchar(50),

    -- Corte y cantidad
    n_corte             varchar(100),
    cantidad            varchar(50),

    -- Responsable
    ficha_realizada_por varchar(255),
    descripcion         text,

    -- Precios
    precio_confeccion   varchar(50),
    precio_empaque      varchar(50),
    empaque_activo      boolean         NOT NULL DEFAULT true,
    precio_manualidad   varchar(50),

    -- Foto seleccionada (1, 2 o 3)
    foto_seleccionada   smallint        NOT NULL DEFAULT 1,

    -- Texto piezas DXF
    texto_piezas        varchar(500),

    -- Tabla de medidas
    talla1              varchar(20)     NOT NULL DEFAULT 'XL',
    talla2              varchar(20)     NOT NULL DEFAULT '2XL',
    talla3              varchar(20)     NOT NULL DEFAULT '3XL',
    filas_medidas       jsonb,          -- [{label, xl, xxl, xxxl}]

    -- Campos de texto libre
    combinacion_colores text,
    confeccion          text,
    nota_verificar      text,
    consumo_sesgo       text,
    nota_final          text,

    -- Auditoria
    created_by          varchar(255),
    created_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fichas_confeccion_referencia
    ON public.fichas_confeccion(referencia);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_fichas_confeccion_referencia;
-- DROP TABLE IF EXISTS public.fichas_confeccion;
