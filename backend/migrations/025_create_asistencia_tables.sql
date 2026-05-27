-- migrations/025_create_asistencia_tables.sql
-- Descripción: create_asistencia_tables
-- Fecha: 2026-05-27
-- Autor: Luis

-- ==================== UP ====================

CREATE TABLE IF NOT EXISTS public.asistencia_empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    horario_habitual JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.asistencia_registros (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES public.asistencia_empleados(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    turno VARCHAR(100) NOT NULL DEFAULT 'Habitual',
    hora_entrada TIME,
    hora_salida TIME,
    horas_comida NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    horas_trabajadas NUMERIC(5,2),
    horas_esperadas NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    balance NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_empleado_fecha UNIQUE (empleado_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencia_registros_empleado_fecha 
    ON public.asistencia_registros(empleado_id, fecha);

CREATE INDEX IF NOT EXISTS idx_asistencia_registros_fecha 
    ON public.asistencia_registros(fecha);

-- ==================== DOWN ====================
-- DROP INDEX IF EXISTS public.idx_asistencia_registros_fecha;
-- DROP INDEX IF EXISTS public.idx_asistencia_registros_empleado_fecha;
-- DROP TABLE IF EXISTS public.asistencia_registros;
-- DROP TABLE IF EXISTS public.asistencia_empleados;
