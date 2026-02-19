# Índice de Documentación - Plow

Bienvenido a la documentación completa del sistema Plow. Este índice te ayudará a navegar por toda la documentación disponible.

---

## 📋 Documentación General

### 1. [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)
Guía completa para acceder a la aplicación desde otros PCs en la red local y para migrar el proyecto a otro servidor.

**Temas:**
- Acceder desde otro PC
- Instalar certificados SSL
- Migrar a otro servidor
- Solución de problemas

### 2. [ARQUITECTURA_SISTEMA.md](./ARQUITECTURA_SISTEMA.md)
Descripción general de la arquitectura del sistema, estructura de carpetas y patrones de diseño.

**Temas:**
- Stack tecnológico
- Estructura del proyecto
- Módulos principales
- Flujo de datos
- Patrones de diseño
- Seguridad
- Escalabilidad

---

## 🔐 Módulo de Autenticación

### 3. [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md)
Gestión de usuarios, login, registro y control de acceso.

**Temas:**
- Login con loginCode + PIN
- Registro de usuarios
- Cambio de PIN
- Gestión de roles
- Tokens JWT
- Endpoints API
- Seguridad

---

## 👥 Módulos de Gestión de Entidades

### 4. [MODULO_CLIENTES.md](./MODULO_CLIENTES.md)
Gestión del catálogo de clientes.

**Temas:**
- CRUD de clientes
- Asociación con vendedores
- Validación de datos
- Endpoints API
- Relaciones
- Reportes

### 5. [MODULO_VENDEDORES.md](./MODULO_VENDEDORES.md)
Gestión de vendedores y sus métricas.

**Temas:**
- CRUD de vendedores
- Asignación de clientes
- Comisiones
- Métricas de desempeño
- Endpoints API

### 6. [MODULO_CONFECCIONISTAS.md](./MODULO_CONFECCIONISTAS.md)
Gestión de confeccionistas (productores).

**Temas:**
- CRUD de confeccionistas
- Asignación de órdenes
- Seguimiento de producción
- Endpoints API

### 7. [MODULO_REFERENCIAS.md](./MODULO_REFERENCIAS.md)
Catálogo de productos y referencias.

**Temas:**
- CRUD de referencias
- Especificaciones técnicas
- Precios y costos
- Endpoints API

---

## 📦 Módulos de Operaciones

### 8. [MODULO_PEDIDOS.md](./MODULO_PEDIDOS.md)
Gestión de pedidos de clientes.

**Temas:**
- Creación de pedidos
- Detalles de líneas
- Estados de pedido
- Seguimiento
- Endpoints API
- Flujo de pedido

### 9. [MODULO_PRODUCCION.md](./MODULO_PRODUCCION.md)
Seguimiento de la producción.

**Temas:**
- Asignación a confeccionistas
- Seguimiento de avance
- Cambio de estados
- Reportes de producción
- Endpoints API
- Métricas

### 10. [MODULO_RECEPCIONES.md](./MODULO_RECEPCIONES.md)
Gestión de recepciones de materiales.

**Temas:**
- Recepción de materiales
- Devoluciones
- Inventario
- Endpoints API

### 11. [MODULO_DESPACHOS.md](./MODULO_DESPACHOS.md)
Gestión de despachos a clientes.

**Temas:**
- Creación de despachos
- Asignación a correrias
- Seguimiento de entregas
- Endpoints API

### 12. [MODULO_CORRERIAS.md](./MODULO_CORRERIAS.md)
Gestión de rutas de entrega.

**Temas:**
- CRUD de correrias
- Asignación de despachos
- Optimización de rutas
- Endpoints API

### 13. [MODULO_FECHAS_ENTREGA.md](./MODULO_FECHAS_ENTREGA.md)
Gestión del calendario de entregas.

**Temas:**
- Calendario de entregas
- Planificación
- Alertas de vencimiento
- Endpoints API

---

## 💾 Módulo de Backups

### 14. [MODULO_BACKUPS.md](./MODULO_BACKUPS.md)
Gestión de copias de seguridad de la base de datos.

**Temas:**
- Backups automáticos
- Backups manuales
- Restauración
- Política de retención
- Recuperación de desastres
- Mejores prácticas

---

## 🗺️ Mapa de Módulos

```
┌─────────────────────────────────────────────────────────┐
│                    PLOW SYSTEM                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         AUTENTICACIÓN (Módulo 3)                │  │
│  │  - Login / Logout                               │  │
│  │  - Gestión de usuarios                          │  │
│  │  - Roles y permisos                             │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │      GESTIÓN DE ENTIDADES (Módulos 4-7)        │  │
│  │  - Clientes (Módulo 4)                          │  │
│  │  - Vendedores (Módulo 5)                        │  │
│  │  - Confeccionistas (Módulo 6)                   │  │
│  │  - Referencias (Módulo 7)                       │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │      OPERACIONES (Módulos 8-13)                │  │
│  │  - Pedidos (Módulo 8)                           │  │
│  │  - Producción (Módulo 9)                        │  │
│  │  - Recepciones (Módulo 10)                      │  │
│  │  - Despachos (Módulo 11)                        │  │
│  │  - Correrias (Módulo 12)                        │  │
│  │  - Fechas de Entrega (Módulo 13)                │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │         BACKUPS (Módulo 14)                     │  │
│  │  - Backups automáticos                          │  │
│  │  - Restauración                                 │  │
│  │  - Recuperación de desastres                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos Principal

```
CLIENTE
  ↓
PEDIDO (Módulo 8)
  ↓
LÍNEAS DE PEDIDO
  ↓
ASIGNACIÓN A CONFECCIONISTA (Módulo 9)
  ↓
PRODUCCIÓN (Módulo 9)
  ↓
RECEPCIÓN (Módulo 10)
  ↓
DESPACHO (Módulo 11)
  ↓
CORRERÍA (Módulo 12)
  ↓
ENTREGA AL CLIENTE
```

---

## 📊 Relaciones Entre Módulos

```
AUTENTICACIÓN (3)
    ↓
    ├─→ CLIENTES (4) ←─ VENDEDORES (5)
    │       ↓
    │   PEDIDOS (8)
    │       ↓
    │   LÍNEAS DE PEDIDO
    │       ├─→ REFERENCIAS (7)
    │       └─→ PRODUCCIÓN (9)
    │               ↓
    │           CONFECCIONISTAS (6)
    │
    ├─→ RECEPCIONES (10)
    │
    ├─→ DESPACHOS (11)
    │       ↓
    │   CORRERIAS (12)
    │
    └─→ FECHAS DE ENTREGA (13)

BACKUPS (14) - Respalda todo
```

---

## 🚀 Guía de Inicio Rápido

### Para Desarrolladores

1. Lee [ARQUITECTURA_SISTEMA.md](./ARQUITECTURA_SISTEMA.md) para entender la estructura
2. Lee [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md) para entender la seguridad
3. Lee los módulos específicos que necesites modificar

### Para Administradores

1. Lee [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md) para configurar acceso
2. Lee [MODULO_BACKUPS.md](./MODULO_BACKUPS.md) para gestionar backups
3. Lee los módulos de operaciones para entender los procesos

### Para Usuarios

1. Lee [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md) para acceder a la aplicación
2. Lee los módulos específicos de tu rol (vendedor, confeccionista, etc.)

---

## 📚 Recursos Adicionales

### Tecnologías Utilizadas

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **Autenticación:** JWT
- **Seguridad:** HTTPS/SSL, CORS
- **Deployment:** PM2, PWA

### Enlaces Útiles

- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

## 🆘 Soporte y Troubleshooting

Cada módulo incluye una sección de "Troubleshooting" con soluciones a problemas comunes.

### Problemas Generales

- **Error de conexión:** Ver [ACCESO_RED_LOCAL.md](./ACCESO_RED_LOCAL.md)
- **Error de autenticación:** Ver [MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md)
- **Error de base de datos:** Ver [MODULO_BACKUPS.md](./MODULO_BACKUPS.md)

---

## 📝 Notas Importantes

1. **Seguridad:** Todos los datos sensibles están protegidos con HTTPS y JWT
2. **Backups:** Se crean automáticamente diariamente a las 7 AM
3. **Roles:** El sistema soporta múltiples roles con permisos específicos
4. **Escalabilidad:** La arquitectura está diseñada para crecer

---

## 🔄 Versión y Cambios

- **Versión Actual:** 1.0.0
- **Última Actualización:** Febrero 2026
- **Próximas Mejoras:** Ver sección "Próximos Pasos" en cada módulo

---

## 📞 Contacto

Para preguntas o sugerencias sobre la documentación, contacta al equipo de desarrollo.

---

**¡Gracias por usar Plow!**
