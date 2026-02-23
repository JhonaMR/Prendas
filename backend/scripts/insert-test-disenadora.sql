-- ============================================
-- SCRIPT SQL: Insertar Diseñadora de Prueba
-- ============================================

-- Insertar una diseñadora de prueba
INSERT INTO disenadoras (nombre, cedula, telefono, activa, created_at, updated_at)
VALUES (
    'María García',
    '1234567890',
    '3001234567',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verificar que se insertó correctamente
SELECT * FROM disenadoras;
