-- ============================================================
-- SCRIPT: Crear usuario Soporte - Base de datos Melas
-- ============================================================
-- BD:      inventory_melas
-- Host:    localhost:5433
-- Usuario: postgres
--
-- EJECUTAR en el servidor de Melas:
--   psql -h localhost -p 5433 -U postgres -d inventory_melas -f create-soporte-user.sql
--
-- PIN inicial del usuario: 1234
-- Cámbialo desde la app después del primer acceso.
-- ============================================================

\c inventory_melas

-- 1. Verificar si ya existe
SELECT id, name, login_code, role, active
FROM users
WHERE UPPER(login_code) = 'SOP';

-- 2. Crear el usuario soporte (solo si el SELECT anterior no devolvió filas)
--    PIN: 1234  |  Hash bcrypt salt 10
INSERT INTO users (id, name, login_code, pin_hash, role, active)
SELECT
    'sop' || to_char(NOW(), 'YYYYMMDDHH24MISS'),
    'Soporte',
    'SOP',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'soporte',
    1
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE UPPER(login_code) = 'SOP'
);

-- 3. Confirmar resultado
SELECT id, name, login_code, role, active, created_at
FROM users
WHERE UPPER(login_code) = 'SOP';
