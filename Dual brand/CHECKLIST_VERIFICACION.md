# ✅ CHECKLIST DE VERIFICACIÓN

Usa este checklist para verificar que todo está configurado correctamente.

---

## 📋 Archivos Creados

- [ ] `Prendas/.env.prendas` - Configuración PRENDAS (raíz)
- [ ] `Prendas/.env.melas` - Configuración MELAS (raíz)
- [ ] `Prendas/backend/.env.prendas` - Configuración PRENDAS (backend)
- [ ] `Prendas/backend/.env.melas` - Configuración MELAS (backend)
- [ ] `Prendas/backend/ecosystem.config.js` - Actualizado con 8 procesos
- [ ] `Prendas/public/config.js` - Detección automática de marca
- [ ] `Prendas/backend/start-pm2.bat` - Script de inicio
- [ ] `Prendas/backend/stop-pm2.bat` - Script de parada
- [ ] `Prendas/backend/restart-pm2.bat` - Script de reinicio
- [ ] `Prendas/backend/status-pm2.bat` - Ver estado
- [ ] `Prendas/backend/logs-pm2.bat` - Ver logs
- [ ] `Prendas/backend/verify-setup.bat` - Verificar instalación
- [ ] `Prendas/backend/create-databases.bat` - Crear BDs
- [ ] `Prendas/backend/init-databases.bat` - Inicializar tablas
- [ ] `Prendas/backend/init-databases.sql` - Script SQL
- [ ] `Prendas/SETUP_DUAL_BRANDS.md` - Documentación completa
- [ ] `Prendas/QUICK_START.md` - Inicio rápido
- [ ] `Prendas/MONTAJE_COMPLETADO.md` - Resumen del montaje
- [ ] `Prendas/backend/AUTOSTART_SETUP.md` - Inicio automático

---

## 🔧 Instalación de Dependencias

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] PM2 instalado globalmente (`pm2 --version`)
- [ ] PostgreSQL instalado (`psql --version`)

Si falta algo, ejecuta:

```bash
# PM2 (si no está instalado)
npm install -g pm2

# Dependencias del proyecto
cd Prendas
npm install
cd backend
npm install
```

---

## 🗄️ Bases de Datos

- [ ] PostgreSQL está corriendo
- [ ] Ejecutaste `create-databases.bat`
- [ ] Ejecutaste `init-databases.bat`
- [ ] Verificar BDs creadas:

```bash
psql -U postgres -l
```

Deberías ver:
- `inventory_prendas`
- `inventory_melas`

---

## 🚀 Procesos PM2

- [ ] Ejecutaste `start-pm2.bat`
- [ ] Verificar procesos:

```bash
pm2 status
```

Deberías ver 8 procesos:
1. prendas-backend
2. prendas-frontend
3. prendas-backup-scheduler
4. prendas-images-backup-scheduler
5. melas-backend
6. melas-frontend
7. melas-backup-scheduler
8. melas-images-backup-scheduler

---

## 🌐 Acceso a Aplicaciones

### PRENDAS

- [ ] Frontend accesible: http://localhost:5173
- [ ] Backend accesible: http://localhost:3000/api/health
- [ ] BD conectada: `inventory_prendas`

### MELAS

- [ ] Frontend accesible: http://localhost:5174
- [ ] Backend accesible: http://localhost:3001/api/health
- [ ] BD conectada: `inventory_melas`

---

## 🔍 Verificación de Configuración

### PRENDAS

- [ ] Puerto backend: 3000 (en `.env.prendas`)
- [ ] Puerto frontend: 5173 (en `ecosystem.config.js`)
- [ ] BD: `inventory_prendas` (en `.env.prendas`)
- [ ] JWT Secret: `tu_secreto_super_seguro_cambialo_123456` (en `.env.prendas`)

### MELAS

- [ ] Puerto backend: 3001 (en `.env.melas`)
- [ ] Puerto frontend: 5174 (en `ecosystem.config.js`)
- [ ] BD: `inventory_melas` (en `.env.melas`)
- [ ] JWT Secret: `tu_secreto_super_seguro_cambialo_123456_melas` (en `.env.melas`)

---

## 📱 Detección de Marca

- [ ] Abre http://localhost:5173 en el navegador
- [ ] Abre la consola (F12)
- [ ] Deberías ver: `[Config] Marca detectada: Prendas`
- [ ] Abre http://localhost:5174 en el navegador
- [ ] Abre la consola (F12)
- [ ] Deberías ver: `[Config] Marca detectada: Melas`

---

## 📊 Logs

- [ ] Ejecuta `logs-pm2.bat`
- [ ] Deberías ver logs de ambas marcas
- [ ] No hay errores críticos

---

## 🔄 Funcionalidad

### PRENDAS

- [ ] Puedo acceder al login
- [ ] Puedo crear un usuario
- [ ] Puedo acceder al dashboard
- [ ] Puedo crear un inventario
- [ ] Los datos se guardan en `inventory_prendas`

### MELAS

- [ ] Puedo acceder al login
- [ ] Puedo crear un usuario
- [ ] Puedo acceder al dashboard
- [ ] Puedo crear un inventario
- [ ] Los datos se guardan en `inventory_melas`

---

## 🔐 Seguridad

- [ ] JWT Secrets son diferentes para cada marca
- [ ] CORS está configurado correctamente
- [ ] Certificados SSL están en su lugar

---

## 📱 PWA

- [ ] Puedo instalar PRENDAS como PWA
- [ ] Puedo instalar MELAS como PWA
- [ ] Cada una se instala como app separada

---

## 🔄 Backups

- [ ] Backups programados están configurados
- [ ] PRENDAS: 22:00 (BD) y 23:00 (imágenes)
- [ ] MELAS: 22:00 (BD) y 23:00 (imágenes)

---

## 🛑 Parada y Reinicio

- [ ] Ejecuta `stop-pm2.bat` - Todos los procesos se detienen
- [ ] Ejecuta `start-pm2.bat` - Todos los procesos se inician
- [ ] Ejecuta `restart-pm2.bat` - Todos los procesos se reinician

---

## 🔄 Inicio Automático (Opcional)

- [ ] Configuraste inicio automático en Windows (ver `AUTOSTART_SETUP.md`)
- [ ] Reiniciaste la computadora
- [ ] Los procesos se iniciaron automáticamente

---

## 📝 Documentación

- [ ] Leíste `SETUP_DUAL_BRANDS.md`
- [ ] Leíste `QUICK_START.md`
- [ ] Leíste `MONTAJE_COMPLETADO.md`
- [ ] Leíste `AUTOSTART_SETUP.md` (si configuraste inicio automático)

---

## ✅ Resumen

Si todas las casillas están marcadas, ¡todo está funcionando correctamente!

Si algo no funciona:

1. Revisa los logs: `pm2 logs`
2. Verifica los puertos: `netstat -ano | findstr :3000`
3. Verifica las BDs: `psql -U postgres -l`
4. Ejecuta `verify-setup.bat` para verificar la instalación
5. Consulta la documentación

---

## 🚀 Próximos Pasos

1. Configura los usuarios para cada marca
2. Importa los datos iniciales
3. Prueba todas las funcionalidades
4. Configura los backups automáticos
5. Configura el inicio automático (opcional)

