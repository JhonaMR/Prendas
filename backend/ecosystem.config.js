/**
 * Configuración de PM2 para el backend, frontend y scheduler de backups
 * 
 * Comandos útiles:
 * - npm run pm2:start          : Inicia backend + frontend + scheduler
 * - npm run pm2:start:prod     : Inicia en producción
 * - npm run pm2:stop           : Detiene la aplicación
 * - npm run pm2:restart        : Reinicia la aplicación
 * - npm run pm2:logs           : Ver logs
 * - npm run pm2:monit          : Monitor en tiempo real
 * - npm run pm2:save           : Guarda la configuración
 * - npm run pm2:resurrect      : Restaura procesos guardados
 * 
 * Procesos que se inician:
 * 1. inventario-backend - Servidor Node.js (puerto 3000)
 * 2. inventario-frontend - Vite dev server (puerto 5173)
 * 3. inventario-backup-scheduler - Backups automáticos (22:00 cada día)
 */

module.exports = {
  apps: [
    {
      // Aplicación principal
      name: 'inventario-backend',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', 'backups']
    },
    {
      // Frontend - Vite dev server
      name: 'inventario-frontend',
      script: './start-frontend.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      watch: false,
      max_memory_restart: '300M'
    },
    {
      // Backup programado diariamente a las 22:00 (10pm)
      name: 'inventario-backup-scheduler',
      script: './src/scripts/scheduledBackup.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 22 * * *', // Cada día a las 22:00 (10pm)
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/backup-error.log',
      out_file: './logs/backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: false, // No reiniciar automáticamente, solo por cron
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
