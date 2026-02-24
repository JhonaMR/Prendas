# 📦 REQUISITOS DE NPM, NODE Y VITE

## Versiones Requeridas

**npm:** 9.x o superior  
**Node.js:** 18.x o superior (recomendado 20.x)  
**Vite:** 6.2.0 o superior  
**React:** 19.2.4 o superior  
**TypeScript:** 5.8.2 o superior

---

## ¿Por qué?

- El proyecto usa `lockfileVersion: 3` en `package-lock.json`, que requiere npm 9.x o superior
- Vite 6.2.0 es la versión especificada en `package.json`
- React 19.2.4 es la versión especificada
- TypeScript 5.8.2 es la versión especificada

---

## Verificar tu versión actual

```bash
npm --version
node --version
npx vite --version
```

---

## Si necesitas actualizar

### Opción 1: Actualizar npm (Recomendado)
```bash
npm install -g npm@latest
```

### Opción 2: Instalar Node.js completo
- Descarga desde: https://nodejs.org/
- Elige la versión LTS (20.x o superior)
- Instala normalmente

### Vite se instalará automáticamente
Cuando ejecutes `npm install` en `Prendas/`, Vite 6.2.0 se instalará automáticamente.

---

## Después de actualizar

Verifica que funcione:
```bash
npm --version
node --version
```

Deberías ver:
- npm: 9.x.x o superior
- node: 18.x.x o superior

---

## Luego ejecuta

```bash
# Backend
cd Prendas/backend
npm install
npm run dev

# Frontend (en otra terminal)
cd Prendas
npm install
npm run dev
```

¡Listo! 🚀
