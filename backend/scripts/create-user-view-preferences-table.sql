-- Crear tabla para guardar preferencias de orden de vistas por usuario
CREATE TABLE IF NOT EXISTS user_view_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    view_order JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_view_preferences_user_id ON user_view_preferences(user_id);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_view_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_view_preferences_timestamp ON user_view_preferences;
CREATE TRIGGER trigger_update_user_view_preferences_timestamp
BEFORE UPDATE ON user_view_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_view_preferences_timestamp();
