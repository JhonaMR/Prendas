/**
 * Script para arreglar las tablas del chat
 * Cambia user_id de INT a VARCHAR
 */

require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inventory'
});

const fixTablesSQL = `
-- Eliminar las tablas existentes
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Recrear user_sessions con user_id como VARCHAR
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  socket_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',
  connected_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, socket_id)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Recrear messages con sender_id y receiver_id como VARCHAR
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  receiver_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_different_users CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read ON messages(read);
`;

async function fixChatTables() {
  const client = await pool.connect();

  try {
    console.log('🔄 Conectando a PostgreSQL...');
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`📍 Base de datos: ${process.env.DB_NAME || 'inventory'}`);
    console.log('');

    console.log('📝 Arreglando tablas del chat...');
    await client.query(fixTablesSQL);

    console.log('✅ Tablas arregladas exitosamente');
    console.log('');
    console.log('📊 Cambios realizados:');
    console.log('   - user_sessions.user_id: INT → VARCHAR(255)');
    console.log('   - messages.sender_id: INT → VARCHAR(255)');
    console.log('   - messages.receiver_id: INT → VARCHAR(255)');
    console.log('');
    console.log('✨ Fix completado');
  } catch (error) {
    console.error('❌ Error arreglando tablas:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixChatTables();
