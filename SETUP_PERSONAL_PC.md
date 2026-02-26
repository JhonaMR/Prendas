# Guía: Mover Prendas a tu PC Personal

## Resumen Rápido
Este documento te guía para replicar todo el sistema en tu PC personal, incluyendo código, base de datos y dependencias.

---

## 1. Requisitos Previos

Asegúrate de tener instalado en tu PC personal:
- **Git** (para clonar el repositorio)
- **Node.js** (v18+) y npm
- **PostgreSQL** (v18+) - **IMPORTANTE: Instálalo en el puerto 5433** (mismo que usas ahora)

---

## 2. Base de Datos

### Dump Disponible
El dump completo de la BD está en:
```
Prendas/backend/backups/inventory-dump-2026-02-26-15-35-46.sql
```

### Pasos para Restaurar en tu PC

**1. Crear la base de datos vacía:**
```powershell
$env:PGPASSWORD='Contrasena14.'
psql -U postgres -h localhost -p 5433 -c "CREATE DATABASE inventory;"
```

**2. Restaurar el dump:**
```powershell
$env:PGPASSWORD='Contrasena14.'
psql -U postgres -h localhost -p 5433 inventory < inventory-dump-2026-02-26-15-35-46.sql
```

**Nota:** La contraseña es `Contrasena14.` (igual a la actual)

---

## 3. Código y Dependencias

### Estructura del Proyecto
```
Prendas/
├── package.json          (Frontend - React + Vite)
├── src/                  (Frontend code)
├── backend/
│   ├── package.json      (Backend - Express + Node.js)
│   ├── src/              (Backend code)
│   └── ...
└── ...
```

### Instalación de Dependencias

**En la raíz (Frontend):**
```bash
cd Prendas
npm install
```

**En backend:**
```bash
cd Prendas/backend
npm install
```

**Resumen de dependencias:**

| Ubicación | Propósito | Dependencias Clave |
|-----------|-----------|-------------------|
| **Raíz** | Frontend (React + Vite) | react, react-dom, vite, tailwindcss, exceljs, jspdf |
| **Backend** | API Express + PostgreSQL | express, pg, socket.io, bcrypt, multer, sharp |

---

## 4. Variables de Entorno

Las variables ya están configuradas en los archivos `.env`:

**Prendas/.env** (Frontend)
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://10.10.0.34:5173
```

**Prendas/backend/.env** (Backend)
```
PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=Contrasena14.
DB_NAME=inventory
DB_SSL=false
USE_HTTPS=true
```

**Si necesitas cambiar algo** (ej: puerto local diferente), edita estos archivos.

---

## 5. Certificados SSL

Los certificados SSL están en:
```
Prendas/backend/certs/
├── server.crt
└── server.key
```

Estos se copian automáticamente con el repositorio. Si necesitas regenerarlos:
```bash
cd Prendas/backend
npm run generate-ssl
```

---

## 6. Iniciar el Sistema

### Opción 1: Desarrollo (Recomendado para tu PC)

**Terminal 1 - Backend:**
```bash
cd Prendas/backend
npm run dev
```
El backend corre en `https://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd Prendas
npm run dev
```
El frontend corre en `http://localhost:5173`

### Opción 2: Producción (con PM2)

```bash
cd Prendas/backend
npm run pm2:start
```

---

## 7. Checklist Completo

- [ ] Git clonado: `git clone <repo-url>`
- [ ] PostgreSQL instalado en puerto 5433
- [ ] Base de datos restaurada con el dump
- [ ] `npm install` en raíz (Prendas/)
- [ ] `npm install` en backend (Prendas/backend/)
- [ ] Variables de entorno verificadas en `.env`
- [ ] Backend iniciado: `npm run dev` en backend/
- [ ] Frontend iniciado: `npm run dev` en raíz
- [ ] Acceder a `http://localhost:5173`

---

## 8. Troubleshooting

**Error: "Cannot connect to database"**
- Verifica que PostgreSQL esté corriendo en puerto 5433
- Comprueba la contraseña en `.env`

**Error: "Port 3000 already in use"**
- Cambia el puerto en `.env` (PORT=3001)

**Error: "Module not found"**
- Ejecuta `npm install` nuevamente en la carpeta correspondiente

**Error: "SSL certificate error"**
- Regenera los certificados: `npm run generate-ssl` en backend/

---

## 9. Datos Importantes

- **Dump de BD:** `Prendas/backend/backups/inventory-dump-2026-02-26-15-35-46.sql`
- **Imágenes:** `Prendas/backend/public/images/` (se copian con el repo)
- **Backups históricos:** `Prendas/backend/backups/` (opcional, para referencia)

---

## 10. Notas Finales

- El sistema está configurado para desarrollo local
- Todos los puertos y credenciales son iguales a los actuales
- Si cambias algo en tu PC, actualiza los `.env` correspondientes
- Para sincronizar cambios: `git pull` en la raíz del proyecto

¡Listo! Tu sistema debería funcionar igual en tu PC personal.
