module.exports = {
  apps: [
    {
      name: 'inventario-backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '../logs/err.log',
      out_file: '../logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', '.git'],
      interpreter: 'node'
    },
    {
      name: 'inventario-frontend-prod',
      script: 'start-frontend-prod.cjs',
      instances: 1,
      exec_mode: 'fork',
      cwd: './',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-prod-err.log',
      out_file: './logs/frontend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', '.git'],
      interpreter: 'node'
    }
  ]
};
