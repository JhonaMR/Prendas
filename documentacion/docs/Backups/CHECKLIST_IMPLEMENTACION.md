# CHECKLIST DE IMPLEMENTACIÓN: REPARACIÓN DE BACKUPS

## 📋 VERIFICACIÓN PREVIA

- [ ] Leer `Prendas/RESUMEN_EJECUTIVO_BACKUPS.md`
- [ ] Leer `Prendas/ANALISIS_PROBLEMA_BACKUPS.md`
- [ ] Leer `Prendas/SOLUCION_BACKUPS.md`
- [ ] Verificar que PostgreSQL está corriendo
- [ ] Verificar que tienes acceso a la contraseña de PostgreSQL

---

## 🔧 FASE 1: VALIDACIÓN DE CAMBIOS (5 minutos)

### Verificar que los archivos fueron modificados correctamente

- [ ] Verificar `BackupExecutionService.js` contiene `--encoding=UTF8`
  ```bash
  grep -n "encoding=UTF8" Prendas/backend/src/services/BackupExecutionService.js
  ```
  Debe mostrar: `const command = \`pg_dump --encoding=UTF8 --clean --if-exists...`

- [ ] Verificar que `BackupValidationService.js` existe
  ```bash
  ls -la Prendas/backend/src/services/BackupValidationService.js
  ```

- [ ] Verificar que `validate-and-clean-backups.js` existe
  ```bash
  ls -la Prendas/backend/scripts/validate-and-clean-backups.js
  ```

- [ ] Verificar que `restore-database-improved.ps1` existe
  ```bash
  ls -la Prendas/backend/scripts/restore-database-improved.ps1
  ```

---

## 🧹 FASE 2: LIMPIEZA DE BACKUPS EXISTENTES (10 minutos)

### Limpiar backups corruptos

- [ ] Navegar al directorio backend
  ```bash
  cd Prendas/backend
  ```

- [ ] Ejecutar script de validación y limpieza
  ```bash
  node scripts/validate-and-clean-backups.js
  ```

- [ ] Responder "s" (sí) a cada archivo corrupto
  - [ ] Archivo 1: Limpiado ✓
  - [ ] Archivo 2: Limpiado ✓
  - [ ] Archivo 3: Limpiado ✓
  - [ ] (Continuar para todos los archivos corruptos)

- [ ] Verificar resumen final
  - [ ] Total archivos: ___
  - [ ] Válidos: ___
  - [ ] Corruptos: ___
  - [ ] Limpiados: ___

---

## 💾 FASE 3: GENERAR NUEVO BACKUP (5 minutos)

### Generar backup con sistema reparado

- [ ] Opción A: Esperar a las 22:00 (10pm) para backup automático
  - [ ] Verificar que PM2 está corriendo: `pm2 list`
  - [ ] Verificar que el backup se ejecutó: `ls -lt Prendas/backend/backups/*.sql | head -1`

- [ ] Opción B: Ejecutar backup manual ahora
  ```bash
  npm run backup:manual
  ```
  - [ ] Esperar a que se complete
  - [ ] Verificar que se creó el archivo: `ls -lt Prendas/backend/backups/*.sql | head -1`

- [ ] Verificar tamaño del backup
  ```bash
  ls -lh Prendas/backend/backups/inventory-backup-daily-*.sql | tail -1
  ```
  Debe ser > 10 MB (aproximadamente)

---

## ✔️ FASE 4: VALIDAR NUEVO BACKUP (5 minutos)

### Verificar que el nuevo backup es válido

- [ ] Ejecutar validación nuevamente
  ```bash
  node scripts/validate-and-clean-backups.js
  ```

- [ ] Verificar que el nuevo backup aparece como "✅ OK"
  - [ ] Nombre del archivo: _______________
  - [ ] Tamaño: ___ MB
  - [ ] Tablas: ___

- [ ] Verificar que NO contiene caracteres corruptos
  ```bash
  grep -c "\\\\restrict" Prendas/backend/backups/inventory-backup-daily-*.sql | tail -1
  ```
  Debe mostrar: `0` (cero coincidencias)

---

## 🔄 FASE 5: PROBAR RESTAURACIÓN (10 minutos)

### Probar que el backup se puede restaurar

**IMPORTANTE**: Esta prueba es destructiva. Asegúrate de tener un backup de seguridad.

- [ ] Crear backup de seguridad manual
  ```bash
  npm run backup:manual
  ```

- [ ] Ejecutar script de restauración mejorado
  ```powershell
  cd Prendas/backend
  .\scripts\restore-database-improved.ps1
  ```

- [ ] Seleccionar el nuevo backup cuando se pida
  - [ ] Número de backup seleccionado: ___

- [ ] Ingresar contraseña de PostgreSQL cuando se pida
  - [ ] Contraseña ingresada: ✓

- [ ] Esperar a que se complete la restauración
  - [ ] Backup de seguridad creado: ✓
  - [ ] Restauración completada: ✓
  - [ ] Verificación completada: ✓

- [ ] Verificar que todas las tablas se crearon
  ```bash
  psql -U postgres -h localhost -p 5433 -d inventory -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
  ```
  Debe mostrar: `29` (o más, dependiendo de las tablas)

---

## 📊 FASE 6: VERIFICACIÓN FINAL (5 minutos)

### Verificar que todo está funcionando correctamente

- [ ] Verificar que la aplicación sigue funcionando
  ```bash
  npm run dev
  ```
  - [ ] Servidor inicia sin errores: ✓
  - [ ] Base de datos conecta correctamente: ✓

- [ ] Verificar que los datos están intactos
  - [ ] Puedes ver clientes: ✓
  - [ ] Puedes ver referencias: ✓
  - [ ] Puedes ver órdenes: ✓

- [ ] Verificar que los backups automáticos siguen funcionando
  - [ ] PM2 está corriendo: `pm2 list`
  - [ ] Próximo backup programado: 22:00 (10pm)

---

## 📝 FASE 7: DOCUMENTACIÓN (5 minutos)

### Documentar el proceso completado

- [ ] Crear archivo de log con fecha y hora
  ```bash
  echo "Reparación de backups completada: $(date)" >> Prendas/BACKUP_REPAIR_LOG.txt
  ```

- [ ] Documentar cualquier problema encontrado
  - [ ] Problema 1: _______________
  - [ ] Solución: _______________
  - [ ] Problema 2: _______________
  - [ ] Solución: _______________

- [ ] Comunicar al equipo
  - [ ] Email enviado: ✓
  - [ ] Slack notificado: ✓
  - [ ] Documentación actualizada: ✓

---

## 🎯 RESUMEN DE IMPLEMENTACIÓN

### Tiempo Total Estimado: ~45 minutos

| Fase | Tiempo | Estado |
|------|--------|--------|
| 1. Verificación | 5 min | ⏳ |
| 2. Limpieza | 10 min | ⏳ |
| 3. Nuevo Backup | 5 min | ⏳ |
| 4. Validación | 5 min | ⏳ |
| 5. Restauración | 10 min | ⏳ |
| 6. Verificación Final | 5 min | ⏳ |
| 7. Documentación | 5 min | ⏳ |

---

## ✅ CRITERIOS DE ÉXITO

El proyecto está listo cuando:

- ✅ Todos los backups existentes han sido limpiados o validados
- ✅ Se generó un nuevo backup con el sistema reparado
- ✅ El nuevo backup fue validado como correcto
- ✅ Se probó la restauración exitosamente
- ✅ La aplicación sigue funcionando correctamente
- ✅ Los datos están intactos
- ✅ El equipo fue notificado

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Si algo falla:

1. **Error de conexión a PostgreSQL**
   - [ ] Verificar que PostgreSQL está corriendo
   - [ ] Verificar puerto 5433
   - [ ] Verificar contraseña

2. **Backup corrupto después de limpiar**
   - [ ] Ejecutar limpieza nuevamente
   - [ ] Generar nuevo backup
   - [ ] Contactar al equipo de desarrollo

3. **Restauración falla**
   - [ ] Verificar que el archivo de backup es válido
   - [ ] Verificar que la base de datos existe
   - [ ] Verificar permisos de usuario

4. **Aplicación no conecta después de restaurar**
   - [ ] Verificar credenciales en .env
   - [ ] Verificar que la base de datos tiene datos
   - [ ] Reiniciar la aplicación

---

## 📞 CONTACTO

Si necesitas ayuda:

1. Consulta `Prendas/SOLUCION_BACKUPS.md` - Sección Troubleshooting
2. Consulta `Prendas/ANALISIS_PROBLEMA_BACKUPS.md` - Para entender el problema
3. Contacta al equipo de desarrollo

---

## 📅 PRÓXIMAS ACCIONES

Después de completar este checklist:

- [ ] Programar validación automática de backups (diaria)
- [ ] Configurar alertas si backups fallan
- [ ] Documentar procedimiento de recuperación ante desastres
- [ ] Considerar backup a la nube
- [ ] Realizar prueba de restauración mensual

---

**Fecha de Inicio**: _______________  
**Fecha de Finalización**: _______________  
**Responsable**: _______________  
**Observaciones**: _______________

---

**Estado Final**: 🟢 COMPLETADO / 🟡 EN PROGRESO / 🔴 FALLIDO
