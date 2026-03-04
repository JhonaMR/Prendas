-- ============================================
-- SCRIPT DE INICIALIZACIÓN DE BASES DE DATOS
-- Para PRENDAS y MELAS
-- ============================================

-- Conectarse como superusuario (postgres)
-- psql -U postgres -f init-databases.sql

-- ============================================
-- CREAR BASES DE DATOS
-- ============================================

-- Crear BD para PRENDAS
CREATE DATABASE inventory_prendas
  WITH
  ENCODING = 'UTF8'
  LC_COLLATE = 'C'
  LC_CTYPE = 'C'
  TEMPLATE = template0;

-- Crear BD para MELAS
CREATE DATABASE inventory_melas
  WITH
  ENCODING = 'UTF8'
  LC_COLLATE = 'C'
  LC_CTYPE = 'C'
  TEMPLATE = template0;

-- ============================================
-- CREAR USUARIO (si no existe)
-- ============================================

-- Crear usuario si no existe
DO
$do$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'postgres') THEN
    CREATE USER postgres WITH PASSWORD 'Contrasena14.';
  END IF;
END
$do$;

-- Dar permisos al usuario
ALTER USER postgres WITH SUPERUSER;

-- ============================================
-- ASIGNAR PERMISOS
-- ============================================

-- Permisos para PRENDAS
GRANT ALL PRIVILEGES ON DATABASE inventory_prendas TO postgres;

-- Permisos para MELAS
GRANT ALL PRIVILEGES ON DATABASE inventory_melas TO postgres;

-- ============================================
-- INFORMACIÓN
-- ============================================

-- Ver bases de datos creadas
\l

-- Conectarse a una BD específica
-- \c inventory_prendas
-- \c inventory_melas

-- Ver tablas
-- \dt

-- Ver usuarios
-- \du
