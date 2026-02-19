# Módulo de Autenticación

## Descripción

El módulo de autenticación gestiona el acceso de usuarios al sistema. Implementa un sistema de login basado en código de usuario y PIN, con tokens JWT para mantener sesiones seguras.

---

## Características

- ✅ Login con loginCode + PIN
- ✅ Registro de nuevos usuarios
- ✅ Cambio de PIN
- ✅ Gestión de roles (admin, general)
- ✅ Tokens JWT con expiración
- ✅ Logout

---

## Estructura de Archivos

```
backend/src/
├── controllers/
│   └── authController.js          # Controlador de autenticación
├── middleware/
│   └── auth.js                    # Middleware de validación JWT
└── routes/
    └── auth.js                    # Rutas de autenticación

frontend/src/
├── services/
│   └── api.ts                     # Métodos de autenticación
└── pages/
    └── Login.tsx                  # Página de login
```

---

## Flujo de Autenticación

```
1. Usuario ingresa loginCode + PIN
   ↓
2. Frontend envía POST /api/auth/login
   ↓
3. Backend valida credenciales en BD
   ↓
4. Si es válido, genera JWT token
   ↓
5. Frontend almacena token en localStorage
   ↓
6. Token se envía en headers de peticiones posteriores
   ↓
7. Middleware valida token en cada petición
```

---

## Endpoints API

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "loginCode": "AUXILIAR2",
  "pin": "1234"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "name": "Auxiliar 2",
      "loginCode": "AUXILIAR2",
      "role": "general"
    }
  }
}
```

### Registro
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "loginCode": "NUEVO_USER",
  "pin": "5678",
  "role": "general"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### Cambiar PIN
```
POST /api/auth/change-pin
Authorization: Bearer {token}
Content-Type: application/json

{
  "loginCode": "AUXILIAR2",
  "currentPin": "1234",
  "newPin": "5678"
}

Response:
{
  "success": true,
  "message": "PIN actualizado correctamente"
}
```

### Listar Usuarios (Admin)
```
GET /api/auth/users
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Auxiliar 2",
      "loginCode": "AUXILIAR2",
      "role": "general"
    },
    ...
  ]
}
```

### Actualizar Usuario (Admin)
```
PUT /api/auth/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "role": "admin"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### Eliminar Usuario (Admin)
```
DELETE /api/auth/users/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Usuario eliminado"
}
```

---

## Estructura de Datos

### Usuario
```typescript
interface User {
  id: string;
  name: string;
  loginCode: string;
  pin: string;           // Hasheado en BD
  role: 'admin' | 'general';
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Token
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "1",
  "loginCode": "AUXILIAR2",
  "role": "general",
  "iat": 1708345200,
  "exp": 1708431600
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## Uso en Frontend

### Login
```typescript
import { apiService } from '@/services/api';

const handleLogin = async (loginCode: string, pin: string) => {
  const response = await apiService.login(loginCode, pin);
  
  if (response.success) {
    // Token se guarda automáticamente en localStorage
    // Usuario se redirige al dashboard
    navigate('/dashboard');
  } else {
    // Mostrar error
    console.error(response.message);
  }
};
```

### Verificar Autenticación
```typescript
const isAuthenticated = apiService.isAuthenticated();
const currentUser = apiService.getCurrentUser();

if (!isAuthenticated) {
  navigate('/login');
}
```

### Logout
```typescript
const handleLogout = () => {
  apiService.logout();
  navigate('/login');
};
```

### Enviar Token en Peticiones
```typescript
// El token se envía automáticamente en el header Authorization
// Ejemplo de petición autenticada:
const clients = await apiService.getClients();
// Internamente, el header es:
// Authorization: Bearer {token}
```

---

## Uso en Backend

### Middleware de Autenticación
```javascript
// En routes/auth.js
const { verifyToken } = require('../middleware/auth');

router.get('/users', verifyToken, authController.listUsers);
```

### Controlador
```javascript
// En controllers/authController.js
const login = async (req, res) => {
  const { loginCode, pin } = req.body;
  
  // Validar credenciales
  const user = await User.findOne({ loginCode });
  
  if (!user || !user.validatePin(pin)) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
  
  // Generar token
  const token = jwt.sign(
    { id: user.id, loginCode: user.loginCode, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  
  res.json({
    success: true,
    data: { token, user }
  });
};
```

---

## Seguridad

### Mejores Prácticas

1. **Contraseñas Hasheadas**
   - Los PINs se almacenan hasheados con bcrypt
   - Nunca se almacenan en texto plano

2. **Tokens JWT**
   - Expiración de 24 horas
   - Firmados con secreto seguro
   - Se validan en cada petición

3. **HTTPS**
   - Todas las peticiones de autenticación van por HTTPS
   - Previene man-in-the-middle attacks

4. **CORS**
   - Solo orígenes autorizados pueden hacer peticiones
   - Credenciales habilitadas

5. **Rate Limiting**
   - Límite de intentos de login fallidos
   - Previene ataques de fuerza bruta

---

## Troubleshooting

### Error: "Credenciales inválidas"
- Verifica que el loginCode sea correcto
- Verifica que el PIN sea correcto
- Asegúrate de que el usuario existe en la BD

### Error: "Token expirado"
- El token tiene 24 horas de validez
- Haz login nuevamente para obtener un nuevo token

### Error: "No autorizado"
- Verifica que el token esté en el header Authorization
- Verifica que el token sea válido
- Verifica que el usuario tenga permisos para la acción

### Error: "CORS error"
- Verifica que la URL esté en CORS_ORIGIN en backend/.env
- Verifica que el navegador esté en HTTPS

---

## Variables de Entorno

```env
# JWT
JWT_SECRET=mi_secreto_super_seguro_para_jwt_123456
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://10.10.0.34:5173,https://10.10.0.34:3000
```

---

## Próximos Pasos

1. Implementar 2FA (autenticación de dos factores)
2. Agregar recuperación de contraseña
3. Implementar sesiones múltiples
4. Agregar auditoría de logins

---

## Referencias

- JWT: https://jwt.io/
- bcrypt: https://www.npmjs.com/package/bcrypt
- Express Middleware: https://expressjs.com/en/guide/using-middleware.html
