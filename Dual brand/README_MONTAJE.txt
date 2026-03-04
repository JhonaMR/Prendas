================================================================================
                    MONTAJE COMPLETADO - PRENDAS + MELAS
================================================================================

¡El montaje está completado! Ambas marcas están listas para funcionar 
simultáneamente en el mismo servidor.

================================================================================
                              INICIO RÁPIDO
================================================================================

1. Abre una terminal en: C:\Users\luisf\OneDrive\Desktop\Proyecto\Prendas\backend

2. Ejecuta en orden:

   a) verify-setup.bat          (Verificar instalación - 1 min)
   b) create-databases.bat      (Crear BDs - 1 min)
   c) init-databases.bat        (Inicializar tablas - 1 min)
   d) start-pm2.bat             (Iniciar ambas marcas - 1 min)

3. Accede a:
   - PRENDAS: http://localhost:5173
   - MELAS: http://localhost:5174

================================================================================
                            ARCHIVOS CREADOS
================================================================================

CONFIGURACIÓN:
  ✓ Prendas/.env.prendas
  ✓ Prendas/.env.melas
  ✓ Prendas/backend/.env.prendas
  ✓ Prendas/backend/.env.melas
  ✓ Prendas/backend/ecosystem.config.js (actualizado)
  ✓ Prendas/public/config.js

SCRIPTS DE CONTROL:
  ✓ Prendas/backend/start-pm2.bat
  ✓ Prendas/backend/stop-pm2.bat
  ✓ Prendas/backend/restart-pm2.bat
  ✓ Prendas/backend/status-pm2.bat
  ✓ Prendas/backend/logs-pm2.bat
  ✓ Prendas/backend/verify-setup.bat
  ✓ Prendas/backend/create-databases.bat
  ✓ Prendas/backend/init-databases.bat
  ✓ Prendas/backend/init-databases.sql

DOCUMENTACIÓN:
  ✓ Prendas/SETUP_DUAL_BRANDS.md (documentación completa)
  ✓ Prendas/QUICK_START.md (inicio rápido)
  ✓ Prendas/MONTAJE_COMPLETADO.md (resumen del montaje)
  ✓ Prendas/CHECKLIST_VERIFICACION.md (checklist)
  ✓ Prendas/backend/AUTOSTART_SETUP.md (inicio automático)
  ✓ Prendas/README_MONTAJE.txt (este archivo)

================================================================================
                            CONFIGURACIÓN
================================================================================

PRENDAS:
  Backend:  http://localhost:3000
  Frontend: http://localhost:5173
  BD:       inventory_prendas
  Puerto:   3000

MELAS:
  Backend:  http://localhost:3001
  Frontend: http://localhost:5174
  BD:       inventory_melas
  Puerto:   3001

PostgreSQL (compartido):
  Host:     localhost
  Puerto:   5433
  Usuario:  postgres
  Contraseña: Contrasena14.

================================================================================
                          PROCESOS PM2 (8 total)
================================================================================

PRENDAS:
  1. prendas-backend
  2. prendas-frontend
  3. prendas-backup-scheduler
  4. prendas-images-backup-scheduler

MELAS:
  5. melas-backend
  6. melas-frontend
  7. melas-backup-scheduler
  8. melas-images-backup-scheduler

================================================================================
                          COMANDOS DISPONIBLES
================================================================================

INICIAR/DETENER:
  start-pm2.bat       → Inicia ambas marcas
  stop-pm2.bat        → Detiene ambas marcas
  restart-pm2.bat     → Reinicia ambas marcas

MONITOREO:
  status-pm2.bat      → Ver estado de procesos
  logs-pm2.bat        → Ver logs en tiempo real
  pm2 monit           → Monitor interactivo

CONFIGURACIÓN:
  verify-setup.bat    → Verificar instalación
  create-databases.bat → Crear BDs
  init-databases.bat  → Inicializar tablas

================================================================================
                          CARACTERÍSTICAS
================================================================================

✓ Ambas marcas corren simultáneamente
✓ Bases de datos independientes
✓ Puertos diferentes
✓ Procesos PM2 separados
✓ Detección automática de marca por puerto
✓ Configuración por archivo .env
✓ Backups automáticos independientes
✓ PWA instalables como apps separadas
✓ Logs separados por marca
✓ Scripts de inicio/parada

================================================================================
                          PRÓXIMOS PASOS
================================================================================

1. Ejecuta verify-setup.bat para verificar la instalación
2. Ejecuta create-databases.bat para crear las BDs
3. Ejecuta init-databases.bat para inicializar las tablas
4. Ejecuta start-pm2.bat para iniciar ambas marcas
5. Accede a http://localhost:5173 (PRENDAS) y http://localhost:5174 (MELAS)
6. Configura los usuarios y datos para cada marca
7. Prueba todas las funcionalidades
8. (Opcional) Configura el inicio automático (ver AUTOSTART_SETUP.md)

================================================================================
                          DOCUMENTACIÓN
================================================================================

Para más información, consulta:

  • SETUP_DUAL_BRANDS.md      → Documentación completa y detallada
  • QUICK_START.md            → Guía rápida de 5 minutos
  • MONTAJE_COMPLETADO.md     → Resumen del montaje
  • CHECKLIST_VERIFICACION.md → Checklist de verificación
  • AUTOSTART_SETUP.md        → Configurar inicio automático en Windows

================================================================================
                          SOPORTE
================================================================================

Si algo no funciona:

1. Revisa los logs:
   pm2 logs

2. Verifica los puertos:
   netstat -ano | findstr :3000

3. Verifica las BDs:
   psql -U postgres -l

4. Ejecuta verify-setup.bat para verificar la instalación

5. Consulta la documentación en SETUP_DUAL_BRANDS.md

================================================================================
                          ¡LISTO!
================================================================================

El montaje está completado. Ambas marcas están listas para funcionar.

Ejecuta: start-pm2.bat

¡Que disfrutes!

================================================================================
