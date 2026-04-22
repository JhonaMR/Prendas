-- Script para actualizar transportistas existentes con tipo de vehículo por defecto
-- Ejecutar después de aplicar la migración 014

-- Actualizar Gilberto Marin como moto (basado en la lógica de liquidación)
UPDATE public.transportistas 
SET tipo_vehiculo = 'moto' 
WHERE LOWER(nombre) LIKE '%gilberto%';

-- Todos los demás como carro (valor por defecto)
UPDATE public.transportistas 
SET tipo_vehiculo = 'carro' 
WHERE tipo_vehiculo IS NULL OR tipo_vehiculo = '';

-- Verificar los cambios
SELECT id, nombre, tipo_vehiculo FROM public.transportistas ORDER BY nombre;