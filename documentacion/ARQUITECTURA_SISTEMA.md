# Arquitectura del Sistema - Plow

## Visión General

Plow es un sistema de gestión de inventarios, ventas y producción para la industria de la confección. Está construido con una arquitectura modular que separa claramente las responsabilidades entre frontend y backend.

### Stack Tecnológico

**Frontend:**
- React 18 con TypeScript
- Vite (bundler)
- Tailwind CSS (estilos)
- PWA (Progressive Web App)

**Backend:**
- Node.js con Express
- PostgreSQL (base de datos)
- JWT (autenticación)
- HTTPS/SSL (seguridad)

---

## Estructura General del Proyecto

```
mi-proyecto-react/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # Componentes React reutilizables
│   ├── pages/                    # Páginas principales
│   ├── services/                 # Servicios (API, utilidades)
│   ├── types/                    # Tipos TypeScript
│   ├── App.tsx                   # Componente raíz
│   └── index.tsx                 # Punto de entrada
│
├── backend/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/               # Configuración (DB, env)
│   │   ├── controllers/          # Lógica de negocio
│   │   ├── middleware/           # Middlewares Express
│   │   ├── routes/               # Rutas API
│   │   ├── scripts/              # Scripts de utilidad
│   │   └── server.js             # Servidor principal
│   ├── certs/                    # Certificados SSL
│   ├── backups/                  # Backups de base de datos
│   └── package.json
│
├── public/                       # Archivos estáticos
│   ├── config.js                 # Configuración de API en runtime
│   ├── sw.js                     # Service Worker (PWA)
│   └── manifest.json             # Manifest PWA
│
├── dist/                         # Frontend compilado (generado)
├── documentacion/                # Documentación del proyecto
├── index.html                    # HTML principal
├── package.json                  # Dependencias frontend
└── ecosystem.config.cjs          # Configuración PM2
```

---

## Módulos Principales

El sistema está organizado en los siguientes módulos:

### 1. **Módulo de Autenticación**
- Gestión de usuarios y roles
- Login/Logout
- JWT tokens
- Cambio de PIN

📄 Ver: `MODULO_AUTENTICACION.md`

### 2. **Módulo de Gestión de Clientes**
- CRUD de clientes
- Asociación con vendedores
- Validación de datos

📄 Ver: `MODULO_CLIENTES.md`

### 3. **Módulo de Gestión de Vendedores**
- CRUD de vendedores
- Asignación de clientes
- Comisiones y métricas

📄 Ver: `MODULO_VENDEDORES.md`

### 4. **Módulo de Gestión de Confeccionistas**
- CRUD de confeccionistas
- Asignación de órdenes
- Seguimiento de producción

📄 Ver: `MODULO_CONFECCIONISTAS.md`

### 5. **Módulo de Referencias**
- Catálogo de productos
- Especificaciones técnicas
- Precios y costos

📄 Ver: `MODULO_REFERENCIAS.md`

### 6. **Módulo de Pedidos**
- Creación de pedidos
- Detalles de líneas
- Estados y seguimiento

📄 Ver: `MODULO_PEDIDOS.md`

### 7. **Módulo de Producción**
- Seguimiento de producción
- Asignación a confeccionistas
- Estados de avance

📄 Ver: `MODULO_PRODUCCION.md`

### 8. **Módulo de Recepciones**
- Recepción de materiales
- Devoluciones
- Inventario

📄 Ver: `MODULO_RECEPCIONES.md`

### 9. **Módulo de Despachos**
- Gestión de despachos
- Asignación de correrias
- Seguimiento de entregas

📄 Ver: `MODULO_DESPACHOS.md`

### 10. **Módulo de Correrias**
- Gestión de rutas de entrega
- Asignación de despachos
- Optimización de rutas

📄 Ver: `MODULO_CORRERIAS.md`

### 11. **Módulo de Fechas de Entrega**
- Calendario de entregas
- Planificación
- Alertas de vencimiento

📄 Ver: `MODULO_FECHAS_ENTREGA.md`

### 12. **Módulo de Backups**
- Backups automáticos
- Restauración de datos
- Historial de backups

📄 Ver: `MODULO_BACKUPS.md`

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Componentes UI → Estado (React) → Servicios API    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Rutas → Middlewares → Controllers → Servicios      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tablas de Usuarios, Clientes, Pedidos, etc.       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Patrones de Diseño

### 1. **Patrón MVC (Backend)**
- **Model:** Esquemas de base de datos
- **View:** Respuestas JSON
- **Controller:** Lógica de negocio

### 2. **Patrón de Servicios**
- Cada módulo tiene un servicio que encapsula la lógica
- Los controladores usan los servicios
- Facilita testing y reutilización

### 3. **Patrón de Validación**
- Validadores específicos por entidad
- Validación en frontend y backend
- Mensajes de error consistentes

### 4. **Patrón de Autenticación**
- JWT tokens en headers
- Middleware de autenticación
- Roles y permisos

---

## Seguridad

### Autenticación
- JWT tokens con expiración de 24 horas
- Tokens almacenados en localStorage
- Validación en cada petición

### HTTPS/SSL
- Certificados generados con mkcert
- Válidos para la red local
- Renovación cada 3 años

### CORS
- Configurado para aceptar solo orígenes autorizados
- Credenciales habilitadas
- Protección contra ataques cross-origin

### Base de Datos
- Contraseñas hasheadas
- Validación de entrada
- Prepared statements (prevención de SQL injection)

---

## Escalabilidad

### Horizontal
- Múltiples instancias del backend con load balancer
- Caché distribuido (Redis)
- Base de datos replicada

### Vertical
- Optimización de queries
- Índices en base de datos
- Compresión de respuestas

---

## Monitoreo y Logs

### PM2
- Gestión de procesos
- Reinicio automático
- Logs centralizados

### Logs de Aplicación
- Logs de peticiones HTTP
- Logs de errores
- Logs de auditoría

---

## Próximos Pasos

1. Lee la documentación de cada módulo
2. Entiende el flujo de datos
3. Familiarízate con la estructura de carpetas
4. Revisa los ejemplos de código

---

## Contacto

Para preguntas sobre la arquitectura, consulta la documentación específica de cada módulo.
