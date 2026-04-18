-- migrations/011_create_control_telas.sql
-- Descripción: Tablas para control de telas (producción y muestras)

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.control_telas_produccion (
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tela                varchar(255) NOT NULL DEFAULT '',
    color               varchar(255) NOT NULL DEFAULT '',
    und_medida          varchar(1)   NOT NULL DEFAULT 'M' CHECK (und_medida IN ('M','K')),
    rdmto               numeric(10,4),
    subtotal            numeric(14,4),
    iva                 numeric(14,4),
    precio_total_kilos  numeric(14,4),
    precio_total_metros numeric(14,4),
    proveedor           varchar(255) NOT NULL DEFAULT '',
    fecha_compra        date,
    iva_incluido        varchar(2)   NOT NULL DEFAULT 'S' CHECK (iva_incluido IN ('S','N')),
    fe_or_rm            varchar(100) NOT NULL DEFAULT '',
    created_by          varchar(255),
    created_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.control_telas_muestras (
    id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    tela                varchar(255) NOT NULL DEFAULT '',
    color               varchar(255) NOT NULL DEFAULT '',
    und_medida          varchar(1)   NOT NULL DEFAULT 'M' CHECK (und_medida IN ('M','K')),
    rdmto               numeric(10,4),
    subtotal            numeric(14,4),
    iva                 numeric(14,4),
    total_precio_kilos  numeric(14,4),
    total_precio_metros numeric(14,4),
    proveedor           varchar(255) NOT NULL DEFAULT '',
    fecha_compra        date,
    factura_no          varchar(100) NOT NULL DEFAULT '',
    solicita_recibe     varchar(255) NOT NULL DEFAULT '',
    usada_en_produccion varchar(255) NOT NULL DEFAULT '',
    created_by          varchar(255),
    created_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_ctp_tela      ON public.control_telas_produccion(LOWER(tela));
CREATE INDEX IF NOT EXISTS idx_ctp_prov      ON public.control_telas_produccion(LOWER(proveedor));
CREATE INDEX IF NOT EXISTS idx_ctp_fecha     ON public.control_telas_produccion(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_ctm_tela      ON public.control_telas_muestras(LOWER(tela));
CREATE INDEX IF NOT EXISTS idx_ctm_prov      ON public.control_telas_muestras(LOWER(proveedor));
CREATE INDEX IF NOT EXISTS idx_ctm_fecha     ON public.control_telas_muestras(fecha_compra);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_ctm_fecha;
-- DROP INDEX IF EXISTS idx_ctm_prov;
-- DROP INDEX IF EXISTS idx_ctm_tela;
-- DROP INDEX IF EXISTS idx_ctp_fecha;
-- DROP INDEX IF EXISTS idx_ctp_prov;
-- DROP INDEX IF EXISTS idx_ctp_tela;
-- DROP TABLE IF EXISTS public.control_telas_muestras;
-- DROP TABLE IF EXISTS public.control_telas_produccion;
