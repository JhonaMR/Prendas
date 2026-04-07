-- migrations/007_create_programacion_pagos.sql
-- Descripción: Crear tablas para el módulo de Programación de Pagos
--              cuentas_bancarias: personas con cuenta registrada
--              pagos_programados: pagos asignados a un día del calendario
--              descuentos_pago: descuentos (OF o ML) asociados a cada pago
-- Fecha: 2026-04-07

-- ==================== UP ====================

-- ----------------------------------------------------------------------------
-- 1. cuentas_bancarias
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cuentas_bancarias (
    id          serial PRIMARY KEY,
    cedula      varchar(50)  NOT NULL,
    nombre      varchar(255) NOT NULL,
    cuenta      varchar(255) NOT NULL,
    created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cuentas_bancarias_nombre ON public.cuentas_bancarias(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_cuentas_bancarias_cedula ON public.cuentas_bancarias(cedula);

-- ----------------------------------------------------------------------------
-- 2. pagos_programados
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pagos_programados (
    id                  serial PRIMARY KEY,
    fecha               date         NOT NULL,           -- día al que pertenece
    fecha_original      date,                            -- si fue movido, fecha donde se creó
    cuenta_bancaria_id  integer REFERENCES public.cuentas_bancarias(id) ON DELETE SET NULL,
    cedula              varchar(50)  NOT NULL,
    nombre              varchar(255) NOT NULL,
    cuenta              varchar(255) NOT NULL,
    detalle_inicial     varchar(500),                    -- Ref. / Factura
    bruto_of            numeric(15,2) NOT NULL DEFAULT 0,
    bruto_ml            numeric(15,2) NOT NULL DEFAULT 0,
    orden               integer      NOT NULL DEFAULT 0, -- posición dentro del día
    created_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_programados_fecha    ON public.pagos_programados(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_programados_nombre   ON public.pagos_programados(LOWER(nombre));
CREATE INDEX IF NOT EXISTS idx_pagos_programados_cuenta_bancaria_id ON public.pagos_programados(cuenta_bancaria_id);

-- ----------------------------------------------------------------------------
-- 3. descuentos_pago
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.descuentos_pago (
    id          serial PRIMARY KEY,
    pago_id     integer NOT NULL REFERENCES public.pagos_programados(id) ON DELETE CASCADE,
    tipo        varchar(2)   NOT NULL CHECK (tipo IN ('OF', 'ML')),
    etiqueta    varchar(255) NOT NULL DEFAULT '',
    monto       numeric(15,2) NOT NULL DEFAULT 0,
    orden       integer      NOT NULL DEFAULT 0,
    created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_descuentos_pago_pago_id ON public.descuentos_pago(pago_id);
CREATE INDEX IF NOT EXISTS idx_descuentos_pago_tipo    ON public.descuentos_pago(tipo);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS idx_descuentos_pago_tipo;
-- DROP INDEX IF EXISTS idx_descuentos_pago_pago_id;
-- DROP TABLE IF EXISTS public.descuentos_pago;
-- DROP INDEX IF EXISTS idx_pagos_programados_cuenta_bancaria_id;
-- DROP INDEX IF EXISTS idx_pagos_programados_nombre;
-- DROP INDEX IF EXISTS idx_pagos_programados_fecha;
-- DROP TABLE IF EXISTS public.pagos_programados;
-- DROP INDEX IF EXISTS idx_cuentas_bancarias_cedula;
-- DROP INDEX IF EXISTS idx_cuentas_bancarias_nombre;
-- DROP TABLE IF EXISTS public.cuentas_bancarias;
