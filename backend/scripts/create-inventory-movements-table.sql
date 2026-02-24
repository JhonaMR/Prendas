-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  valor_unitario DECIMAL(12, 2) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  proveedor VARCHAR(255),
  referencia_destino VARCHAR(255),
  remision_factura VARCHAR(255),
  movimiento VARCHAR(50) NOT NULL CHECK (movimiento IN ('Entrada', 'Salida')),
  compra_id VARCHAR(50) REFERENCES compras(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_inventory_movements_insumo ON inventory_movements(LOWER(insumo));
CREATE INDEX IF NOT EXISTS idx_inventory_movements_referencia ON inventory_movements(LOWER(referencia_destino));
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movimiento ON inventory_movements(movimiento);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_compra_id ON inventory_movements(compra_id);
