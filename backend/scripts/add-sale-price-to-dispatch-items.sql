-- Agregar columna sale_price a dispatch_items si no existe
ALTER TABLE dispatch_items
ADD COLUMN IF NOT EXISTS sale_price numeric(10,2) DEFAULT 0;

-- Verificar que la columna fue agregada
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'dispatch_items' 
ORDER BY ordinal_position;
