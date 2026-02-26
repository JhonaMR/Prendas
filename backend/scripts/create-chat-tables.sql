-- ============================================
-- CREAR TABLAS PARA EL SISTEMA DE CHAT
-- ============================================

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para queries rápidas
  CONSTRAINT check_different_users CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver 
  ON messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver 
  ON messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_read 
  ON messages(read);

-- Tabla de sesiones de usuario (para tracking de usuarios activos)
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  socket_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'online', -- online, inactive, offline
  connected_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, socket_id)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
  ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_status 
  ON user_sessions(status);

CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity 
  ON user_sessions(last_activity);

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE messages IS 'Almacena todos los mensajes del chat. Se limpian diariamente.';
COMMENT ON TABLE user_sessions IS 'Rastrea sesiones activas de usuarios para determinar quién está online.';

COMMENT ON COLUMN messages.sender_id IS 'ID del usuario que envía el mensaje';
COMMENT ON COLUMN messages.receiver_id IS 'ID del usuario que recibe el mensaje';
COMMENT ON COLUMN messages.content IS 'Contenido del mensaje (máx 1000 caracteres)';
COMMENT ON COLUMN messages.read IS 'Si el mensaje ha sido leído por el receptor';
COMMENT ON COLUMN messages.created_at IS 'Timestamp de creación del mensaje';

COMMENT ON COLUMN user_sessions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_sessions.socket_id IS 'ID del socket de Socket.io';
COMMENT ON COLUMN user_sessions.status IS 'Estado del usuario: online, inactive (>5min), offline';
COMMENT ON COLUMN user_sessions.last_activity IS 'Último timestamp de actividad del usuario';
