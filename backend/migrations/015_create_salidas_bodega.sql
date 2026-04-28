-- migrations/015_create_salidas_bodega.sql
-- Descripción: Tabla para salidas de bodega (préstamos/salidas temporales de mercancía)

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.salidas_bodega (
    id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha            date         NOT NULL DEFAULT CURRENT_DATE,
    referencia       varchar(100) NOT NULL,
    cantidad         integer      NOT NULL CHECK (cantidad > 0),
    talla            varchar(10)  NOT NULL DEFAULT '' CHECK (talla IN ('','2-4','6-8','10-12','14-16','S','M','L','XL','XXL','XXXL')),
    quien_recibe     varchar(255) NOT NULL DEFAULT '',
    fecha_devolucion date,
    created_by       varchar(255),
    created_at       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_sb_referencia  ON public.salidas_bodega(LOWER(referencia));
CREATE INDEX IF NOT EXISTS idx_sb_fecha       ON public.salidas_bodega(fecha);
CREATE INDEX IF NOT EXISTS idx_sb_devolucion  ON public.salidas_bodega(fecha_devolucion);
CREATE INDEX IF NOT EXISTS idx_sb_quien       ON public.salidas_bodega(LOWER(quien_recibe));

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_sb_quien;
-- DROP INDEX IF EXISTS idx_sb_devolucion;
-- DROP INDEX IF EXISTS idx_sb_fecha;
-- DROP INDEX IF EXISTS idx_sb_referencia;
-- DROP TABLE IF EXISTS public.salidas_bodega;
