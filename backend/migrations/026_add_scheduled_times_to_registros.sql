-- migrations/026_add_scheduled_times_to_registros.sql
-- Descripción: add_scheduled_times_to_registros
-- Fecha: 2026-05-27
-- Autor: Luis

-- ==================== UP ====================

ALTER TABLE public.asistencia_registros ADD COLUMN IF NOT EXISTS programado_entrada TIME;
ALTER TABLE public.asistencia_registros ADD COLUMN IF NOT EXISTS programado_salida TIME;

-- Poblar registros existentes con el horario habitual del empleado según el día de la semana
UPDATE public.asistencia_registros r
SET 
  programado_entrada = (
    SELECT (sched->>'entrada')::TIME
    FROM public.asistencia_empleados e,
    jsonb_array_elements(e.horario_habitual) AS sched
    WHERE e.id = r.empleado_id
      AND (sched->>'dia')::int = extract(dow from r.fecha)::int
    LIMIT 1
  ),
  programado_salida = (
    SELECT (sched->>'salida')::TIME
    FROM public.asistencia_empleados e,
    jsonb_array_elements(e.horario_habitual) AS sched
    WHERE e.id = r.empleado_id
      AND (sched->>'dia')::int = extract(dow from r.fecha)::int
    LIMIT 1
  )
WHERE r.programado_entrada IS NULL AND r.programado_salida IS NULL;

-- ==================== DOWN ====================
-- ALTER TABLE public.asistencia_registros DROP COLUMN IF EXISTS programado_entrada;
-- ALTER TABLE public.asistencia_registros DROP COLUMN IF EXISTS programado_salida;
