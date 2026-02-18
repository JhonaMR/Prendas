/**
 * 🔧 MÓDULO DE CONFIGURACIÓN DE VARIABLES DE ENTORNO
 * 
 * Este archivo valida y documenta todas las variables de entorno necesarias
 * para que la aplicación funcione correctamente con PostgreSQL.
 */

const path = require('path');

/**
 * Variables de entorno requeridas y sus valores por defecto
 */
const ENV_CONFIG = {
  // Servidor
  PORT: {
    default: 3000,
    type: 'number',
    description: 'Puerto donde correrá el servidor Express'
  },
  NODE_ENV: {
    default: 'development',
    type: 'string',
    description: 'Entorno de ejecución (development, production o test)',
    validate: (value) => ['development', 'production', 'test'].includes(value)
  },
  HOST: {
    default: '0.0.0.0',
    type: 'string',
    description: 'IP del servidor (0.0.0.0 escucha en todas las interfaces)'
  },

  // JWT
  JWT_SECRET: {
    required: true,
    type: 'string',
    description: 'Secreto para firmar los tokens de autenticación'
  },
  JWT_EXPIRES_IN: {
    default: '24h',
    type: 'string',
    description: 'Tiempo de expiración del token (ejemplos: 1h, 24h, 7d)'
  },

  // PostgreSQL - Conexión
  DB_HOST: {
    default: 'localhost',
    type: 'string',
    description: 'Host del servidor PostgreSQL'
  },
  DB_PORT: {
    default: 5432,
    type: 'number',
    description: 'Puerto de PostgreSQL'
  },
  DB_USER: {
    default: 'postgres',
    type: 'string',
    description: 'Usuario de PostgreSQL'
  },
  DB_PASSWORD: {
    required: true,
    type: 'string',
    description: 'Contraseña del usuario PostgreSQL'
  },
  DB_NAME: {
    default: 'inventory',
    type: 'string',
    description: 'Nombre de la base de datos'
  },

  // PostgreSQL - Connection Pool
  DB_POOL_MIN: {
    default: 5,
    type: 'number',
    description: 'Número mínimo de conexiones en el pool',
    validate: (value) => value >= 1 && value <= 10
  },
  DB_POOL_MAX: {
    default: 20,
    type: 'number',
    description: 'Número máximo de conexiones en el pool',
    validate: (value) => value >= 5 && value <= 100
  },
  DB_IDLE_TIMEOUT: {
    default: 30000,
    type: 'number',
    description: 'Tiempo de inactividad antes de cerrar conexión (ms)',
    validate: (value) => value >= 1000 && value <= 300000
  },
  DB_CONNECTION_TIMEOUT: {
    default: 5000,
    type: 'number',
    description: 'Tiempo máximo para establecer conexión (ms)',
    validate: (value) => value >= 1000 && value <= 60000
  },
  DB_SSL: {
    default: false,
    type: 'boolean',
    description: 'SSL para conexión a PostgreSQL (false en desarrollo, true en producción)'
  },

  // CORS
  CORS_ORIGIN: {
    default: 'http://localhost:5173,http://localhost:3000',
    type: 'string',
    description: 'Orígenes permitidos para hacer peticiones al backend'
  }
};

/**
 * Cargar y validar variables de entorno
 * @returns {Object} Objeto con todas las variables de entorno validadas
 */
function loadEnvironment() {
  const config = {};
  const errors = [];
  const warnings = [];

  console.log('\n🔧 Cargando configuración de variables de entorno...\n');

  for (const [key, spec] of Object.entries(ENV_CONFIG)) {
    const value = process.env[key];

    // Verificar si es requerida
    if (spec.required && !value) {
      errors.push(`❌ Variable requerida no encontrada: ${key}`);
      continue;
    }

    // Usar valor por defecto si no está definida
    let finalValue = value !== undefined ? value : spec.default;

    // Convertir tipo si es necesario
    if (spec.type === 'number' && finalValue !== undefined) {
      const numValue = Number(finalValue);
      if (isNaN(numValue)) {
        errors.push(`❌ ${key} debe ser un número, recibido: ${finalValue}`);
        continue;
      }
      finalValue = numValue;
    } else if (spec.type === 'boolean' && finalValue !== undefined) {
      if (typeof finalValue === 'string') {
        finalValue = finalValue.toLowerCase() === 'true';
      }
    }

    // Validar con función personalizada si existe
    if (spec.validate && finalValue !== undefined) {
      if (!spec.validate(finalValue)) {
        errors.push(`❌ ${key} tiene un valor inválido: ${finalValue}`);
        continue;
      }
    }

    config[key] = finalValue;

    // Log de la variable cargada (sin mostrar contraseñas)
    const displayValue = key.includes('PASSWORD') || key.includes('SECRET') 
      ? '***' 
      : finalValue;
    const source = value !== undefined ? '(desde .env)' : '(valor por defecto)';
    console.log(`✅ ${key}: ${displayValue} ${source}`);
  }

  // Validaciones adicionales
  if (config.DB_POOL_MIN > config.DB_POOL_MAX) {
    errors.push(`❌ DB_POOL_MIN (${config.DB_POOL_MIN}) no puede ser mayor que DB_POOL_MAX (${config.DB_POOL_MAX})`);
  }

  // Mostrar errores y advertencias
  if (errors.length > 0) {
    console.error('\n❌ ERRORES DE CONFIGURACIÓN:\n');
    errors.forEach(error => console.error(error));
    console.error('\n');
    throw new Error('Configuración de variables de entorno inválida');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ ADVERTENCIAS:\n');
    warnings.forEach(warning => console.warn(warning));
    console.warn('\n');
  }

  console.log('✅ Todas las variables de entorno cargadas correctamente\n');
  return config;
}

/**
 * Obtener la configuración cargada
 */
let loadedConfig = null;

function getConfig() {
  if (!loadedConfig) {
    loadedConfig = loadEnvironment();
  }
  return loadedConfig;
}

/**
 * Documentar todas las variables de entorno disponibles
 */
function printEnvironmentDocumentation() {
  console.log('\n📚 DOCUMENTACIÓN DE VARIABLES DE ENTORNO\n');
  console.log('='.repeat(80));

  for (const [key, spec] of Object.entries(ENV_CONFIG)) {
    console.log(`\n${key}`);
    console.log('-'.repeat(40));
    console.log(`Descripción: ${spec.description}`);
    console.log(`Tipo: ${spec.type}`);
    console.log(`Requerida: ${spec.required ? 'Sí' : 'No'}`);
    if (spec.default !== undefined) {
      console.log(`Valor por defecto: ${spec.default}`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

module.exports = {
  loadEnvironment,
  getConfig,
  printEnvironmentDocumentation,
  ENV_CONFIG
};
