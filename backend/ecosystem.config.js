/**
 * Configuración de PM2 para PLOW y MELAS
 * 
 * Ambas marcas corren simultáneamente:
 * - PLOW: Backend puerto 3000, Frontend puerto 5173
 * - MELAS: Backend puerto 3001, Frontend puerto 5174
 * 
 * Comandos útiles:
 * - npm run pm2:start          : Inicia ambas marcas
 * - npm run pm2:start:prod     : Inicia en producción
 * - npm run pm2:stop           : Detiene todo
 * - npm run pm2:restart        : Reinicia todo
 * - npm run pm2:logs           : Ver logs
 * - npm run pm2:monit          : Monitor en tiempo real
 * - npm run pm2:save           : Guarda la configuración
 * - npm run pm2:resurrect      : Restaura procesos guardados
 * 
 * Procesos que se inician (8 total):
 * 1. plow-backend - Servidor Node.js (puerto 3000)
 * 2. plow-frontend - Vite dev server (puerto 5173)
 * 3. plow-backup-scheduler - Backups BD (22:00 cada día)
 * 4. plow-images-backup-scheduler - Backups de imágenes (23:00 cada día)
 * 5. melas-backend - Servidor Node.js (puerto 3001)
 * 6. melas-frontend - Vite dev server (puerto 5174)
 * 7. melas-backup-scheduler - Backups BD (22:00 cada día)
 * 8. melas-images-backup-scheduler - Backups de imágenes (23:00 cada día)
 */

module.exports = {
  apps: [
    // ==================== PLOW ====================
    {
      name: 'plow-backend',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      cwd: './backend',
      env_file: './.env.prendas',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/plow-error.log',
      out_file: './backend/logs/plow-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', 'backups']
    },
    {
      name: 'plow-frontend',
      script: 'node',
      args: 'node_modules/vite/bin/vite.js --port 5173',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        VITE_API_URL: 'https://10.10.0.34:3000/api'
      },
      error_file: './logs/plow-frontend-error.log',
      out_file: './logs/plow-frontend-out.log',
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
      script: './backend/src/scripts/scheduledBackup.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 22 * * *',
      env_file: './backend/.env.prendas',
      cwd: '.',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/plow-backup-error.log',
      out_file: './backend/logs/plow-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'plow-images-backup-scheduler',
      script: './backend/src/scripts/backupImages.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 23 * * *',
      env_file: './backend/.env.prendas',
      cwd: '.',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/plow-images-backup-error.log',
      out_file: './backend/logs/plow-images-backup-out.log',
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
      cwd: './backend',
      env_file: './.env.melas',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/melas-error.log',
      out_file: './backend/logs/melas-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', 'backups']
    },
    {
      name: 'melas-frontend',
      script: 'node',
      args: 'node_modules/vite/bin/vite.js --port 5174',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        VITE_API_URL: 'https://10.10.0.34:3001/api'
      },
      error_file: './logs/melas-frontend-error.log',
      out_file: './logs/melas-frontend-out.log',
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
      script: './backend/src/scripts/scheduledBackup.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 22 * * *',
      env_file: './backend/.env.melas',
      cwd: '.',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/melas-backup-error.log',
      out_file: './backend/logs/melas-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    },
    {
      name: 'melas-images-backup-scheduler',
      script: './backend/src/scripts/backupImages.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 23 * * *',
      env_file: './backend/.env.melas',
      cwd: '.',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './backend/logs/melas-images-backup-error.log',
      out_file: './backend/logs/melas-images-backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
