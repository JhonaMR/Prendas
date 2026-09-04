-- migrations/030_alter_orders_total_value_precision.sql
-- Descripción: Aumentar la precisión de total_value en la tabla orders de NUMERIC(10,2) a NUMERIC(18,2)
-- Fecha: 2026-09-04
-- Autor: Antigravity

-- ==================== UP ====================
ALTER TABLE orders ALTER COLUMN total_value TYPE NUMERIC(18, 2);

-- Registrar la migración en schema_migrations si la tabla existe
INSERT INTO schema_migrations (migration_name, success, execution_time_ms)
VALUES ('030_alter_orders_total_value_precision.sql', true, 0)
ON CONFLICT (migration_name) DO UPDATE SET success = true;

-- ==================== DOWN ====================
-- ALTER TABLE orders ALTER COLUMN total_value TYPE NUMERIC(10, 2);
