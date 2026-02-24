-- Crear tabla de Compras
CREATE TABLE IF NOT EXISTS compras (
  id VARCHAR(50) PRIMARY KEY,
  fecha DATE NOT NULL,
  referencia VARCHAR(255),
  unidades INTEGER,
  insumo VARCHAR(255) NOT NULL,
  cantidad_insumo DECIMAL(10, 2) NOT NULL,
  precio_unidad DECIMAL(10, 2) NOT NULL,
  cantidad_total DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  proveedor VARCHAR(255) NOT NULL,
  fecha_pedido DATE,
  observacion TEXT,
  factura VARCHAR(255),
  precio_real_insumo_und VARCHAR(50) DEFAULT 'pendiente',
  afecta_inventario BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor);
CREATE INDEX IF NOT EXISTS idx_compras_insumo ON compras(insumo);
CREATE INDEX IF NOT EXISTS idx_compras_afecta_inventario ON compras(afecta_inventario);
