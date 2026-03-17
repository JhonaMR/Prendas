# ✅ Checklist - Sistema de Migraciones

## 🚀 Configuración Inicial (Una sola vez)

- [ ] Ejecutar `npm run migrate:setup`
- [ ] Verificar con `npm run migrate:status:all`
- [ ] Leer `MIGRATIONS-QUICKSTART.md`

---

## 📝 Antes de Crear Migración

- [ ] Estoy en rama `develop` o feature branch
- [ ] Sé exactamente qué cambios necesito en la BD
- [ ] Tengo un nombre descriptivo para la migración

---

## 🔨 Crear y Aplicar Migración

- [ ] Crear: `npm run migrate:create "descripcion"`
- [ ] Editar archivo SQL (secciones UP y DOWN)
- [ ] Aplicar en dev: `npm run migrate:up`
- [ ] Probar: `npm run dev`
- [ ] Verificar que funciona correctamente
- [ ] Commit: `git add migrations/XXX_*.sql`

---

## 🚢 Antes de Aplicar en Producción

- [ ] Migración probada en desarrollo
- [ ] Código que usa los cambios funciona
- [ ] Sección DOWN está completa
- [ ] Cambios están en rama `main`
- [ ] Notifiqué al equipo (si aplica)
- [ ] Es horario de bajo tráfico (si es cambio grande)

---

## 🎯 Aplicar en Producción

- [ ] SSH al servidor
- [ ] `git pull origin main`
- [ ] `npm run migrate:up:prod`
- [ ] Verificar: `npm run migrate:status:all`
- [ ] `pm2 restart all`
- [ ] Probar que la aplicación funciona

---

## 🆘 Si Algo Sale Mal

- [ ] Ver error con `npm run migrate:status`
- [ ] Revisar backup en `backend/backups/migrations/`
- [ ] Revertir si es necesario: `npm run migrate:rollback`
- [ ] Corregir SQL y volver a aplicar
