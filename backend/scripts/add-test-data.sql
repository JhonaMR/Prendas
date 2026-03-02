-- Add test designers
INSERT INTO disenadoras (nombre, cedula, telefono, activa) 
VALUES 
  ('María García', '1234567890', '3001234567', true),
  ('Ana Rodríguez', '0987654321', '3009876543', true),
  ('Carmen López', '1122334455', '3005555555', true)
ON CONFLICT DO NOTHING;

-- Add test fichas de diseño
INSERT INTO fichas_diseno (referencia, disenadora_id, descripcion, marca, novedad, costo_total, created_by, created_at, updated_at)
SELECT 
  'REF001',
  d.id,
  'Blusa de algodón',
  'Premium',
  'Nuevo diseño',
  50000,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
FROM disenadoras d WHERE d.nombre = 'María García'
ON CONFLICT DO NOTHING;

INSERT INTO fichas_diseno (referencia, disenadora_id, descripcion, marca, novedad, costo_total, created_by, created_at, updated_at)
SELECT 
  'REF002',
  d.id,
  'Pantalón de denim',
  'Classic',
  'Modelo clásico',
  75000,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
FROM disenadoras d WHERE d.nombre = 'Ana Rodríguez'
ON CONFLICT DO NOTHING;
