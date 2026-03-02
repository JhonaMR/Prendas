-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN - USUARIO SOPORTE
-- ============================================================================
-- Este script crea el usuario del sistema "Soporte" si no existe
-- Usuario: SOP
-- PIN: 3438 (hasheado con bcrypt)
-- Rol: soporte
-- ============================================================================

-- Verificar si el usuario Soporte ya existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE login_code = 'SOP') THEN
        -- Insertar el usuario Soporte
        -- PIN 3438 hasheado con bcrypt (10 rounds)
        INSERT INTO users (id, name, login_code, pin_hash, role, active, created_at, updated_at)
        VALUES (
            'soporte-system-user-' || gen_random_uuid()::text,
            'Soporte',
            'SOP',
            '$2b$10$ygSISazMAL1gXz2cElwVAOf1GsWlX9eGoRi4dHp4hXTH6BrcGGZp2',
            'soporte',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Usuario Soporte creado exitosamente';
    ELSE
        RAISE NOTICE 'El usuario Soporte ya existe';
    END IF;
END $$;

-- ============================================================================
-- HASH BCRYPT GENERADO: $2b$10$ygSISazMAL1gXz2cElwVAOf1GsWlX9eGoRi4dHp4hXTH6BrcGGZp2
-- PIN: 3438
-- ROUNDS: 10
-- ============================================================================

