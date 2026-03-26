/**
 * Configuración de PM2 para PLOW y MELAS
 * 
 * Ambas marcas corren simultáneamente:
 * - PLOW: Backend puerto 3000, Frontend puerto 5173
 * - MELAS: Backend puerto 3001, Frontend puerto 5174
 * 
 * IMPORTANTE: Este archivo se ejecuta desde Prendas/backend/
 * - Backend: cwd: '.' (Prendas/backend), script: './src/server.js'
 * - Frontend: cwd: '..' (Prendas), script: 'node_modules/vite/bin/vite.js'
 * - Schedulers: cwd: '..' (Prendas), script: 'backend/src/scripts/...'
 * - Logs: '../logs/' (Prendas/logs)
 */

module.exports = {
  apps: [
    // ==================== PLOW ====================
    {
      name: 'plow-backend',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      cwd: '.',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: 'tu_secreto_super_seguro_cambialo_123456',
        JWT_EXPIRES_IN: '24h',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'Contrasena14.',
        DB_NAME: 'inventory_plow',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: 'false',
        CORS_ORIGIN: 'http://localhost:3000,http://localhost:5173,http://10.10.0.51:3000,http://10.10.0.51:5173,https://10.10.0.51:3000,https://10.10.0.51:5173',
        HOST: '0.0.0.0',
        USE_HTTPS: 'true'
      },
      error_file: '../logs/plow-error.log',
      out_file: '../logs/plow-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', 'backups']
    },
    {
      name: 'plow-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 5173',
      cwd: '..',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/plow-frontend-error.log',
      out_file: '../logs/plow-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'plow-backup-scheduler',
      script: 'backend/src/scripts/scheduledBackup.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 22 * * *',
      env_file: 'backend/.env.prendas',
      cwd: '..',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/plow-backup-error.log',
      out_file: '../logs/plow-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'plow-images-backup-scheduler',
      script: 'backend/src/scripts/backupImages.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 23 * * *',
      env_file: 'backend/.env.prendas',
      cwd: '..',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/plow-images-backup-error.log',
      out_file: '../logs/plow-images-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    },

    // ==================== MELAS ====================
    {
      name: 'melas-backend',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      cwd: '.',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'tu_secreto_super_seguro_cambialo_123456_melas',
        JWT_EXPIRES_IN: '24h',
        DB_HOST: 'localhost',
        DB_PORT: 5433,
        DB_USER: 'postgres',
        DB_PASSWORD: 'Contrasena14.',
        DB_NAME: 'inventory_melas',
        DB_POOL_MIN: 5,
        DB_POOL_MAX: 20,
        DB_IDLE_TIMEOUT: 30000,
        DB_CONNECTION_TIMEOUT: 5000,
        DB_SSL: 'false',
        CORS_ORIGIN: 'http://localhost:3001,http://localhost:5174,http://10.10.0.42:3001,http://10.10.0.42:5174,https://10.10.0.42:3001,https://10.10.0.42:5174',
        HOST: '0.0.0.0',
        USE_HTTPS: 'true'
      },
      error_file: '../logs/melas-error.log',
      out_file: '../logs/melas-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', 'backups']
    },
    {
      name: 'melas-frontend',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 5174',
      cwd: '..',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/melas-frontend-error.log',
      out_file: '../logs/melas-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'melas-backup-scheduler',
      script: 'backend/src/scripts/scheduledBackup.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 22 * * *',
      env_file: 'backend/.env.melas',
      cwd: '..',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/melas-backup-error.log',
      out_file: '../logs/melas-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'melas-images-backup-scheduler',
      script: 'backend/src/scripts/backupImages.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 23 * * *',
      env_file: 'backend/.env.melas',
      cwd: '..',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/melas-images-backup-error.log',
      out_file: '../logs/melas-images-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
