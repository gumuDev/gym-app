# 🧪 Testing - GymApp API

Archivos para probar los endpoints de la API de GymApp.

---

## 📦 Importar en Postman

1. Abre Postman
2. Click en **Import** (arriba a la izquierda)
3. Selecciona el archivo `GymApp-API.postman_collection.json`
4. La colección se importará con todas las peticiones

---

## 🚀 Configuración Inicial

La colección usa variables:
- `{{baseUrl}}`: `http://localhost:3000` (URL del backend)
- `{{token}}`: Se guarda automáticamente al hacer login

---

## 📝 Flujo de Prueba Recomendado

### 1. Health Check
**Verificar que el backend esté corriendo**
```
GET /health
```
Respuesta esperada: `{ "status": "ok", "message": "GymApp API is running" }`

---

### 2. Login Super Admin
**Autenticarse como super admin**
```
POST /api/auth/login
Body:
{
  "email": "admin@gymapp.com",
  "password": "admin123"
}
```

✅ El token se guarda automáticamente en la variable `{{token}}`

---

### 3. Dashboard - Métricas
**Ver métricas globales** (requiere token de super admin)
```
GET /api/super-admin/dashboard
Header: Authorization: Bearer {{token}}
```

Respuesta:
```json
{
  "totalGyms": 0,
  "activeGyms": 0,
  "totalMembers": 0,
  "activeMembers": 0,
  "mrr": 0
}
```

---

### 4. Crear Gimnasio
**Crear un nuevo gimnasio con admin** (requiere token de super admin)
```
POST /api/super-admin/gyms
Header: Authorization: Bearer {{token}}
Body:
{
  "name": "Gym Olimpo",
  "email": "contacto@olimpo.com",
  "phone": "+51 999 888 777",
  "address": "Av. Principal 123, Lima",
  "adminName": "Carlos Pérez",
  "adminEmail": "admin@olimpo.com",
  "adminPassword": "password123"
}
```

✅ Esto crea:
- Un gimnasio con slug único (ej: `gym-olimpo`)
- Un usuario admin del gimnasio
- Trial period de 30 días

---

### 5. Listar Gimnasios
**Ver todos los gimnasios creados**
```
GET /api/super-admin/gyms
Header: Authorization: Bearer {{token}}
```

---

### 6. Ver Detalle de Gimnasio
**Obtener información completa de un gimnasio**
```
GET /api/super-admin/gyms/:id
Header: Authorization: Bearer {{token}}
```

⚠️ Reemplaza `:id` con el ID real del gimnasio

---

### 7. Actualizar Gimnasio
**Modificar datos de un gimnasio**
```
PATCH /api/super-admin/gyms/:id
Header: Authorization: Bearer {{token}}
Body:
{
  "name": "Gym Olimpo Updated",
  "phone": "+51 999 888 999"
}
```

---

### 8. Activar/Suspender Gimnasio
**Toggle del estado activo**
```
POST /api/super-admin/gyms/:id/toggle
Header: Authorization: Bearer {{token}}
```

---

### 9. Login Admin Gym
**Probar login del admin del gimnasio creado**
```
POST /api/auth/login
Body:
{
  "email": "admin@olimpo.com",
  "password": "password123"
}
```

✅ El token del admin se guarda y reemplaza al del super admin

---

### 10. Generar Facturas Mensuales
**Crear facturas para todos los gyms activos**
```
POST /api/super-admin/invoices/generate
Header: Authorization: Bearer {{token}}
```

---

### 11. Listar Facturas
**Ver todas las facturas generadas**
```
GET /api/super-admin/invoices
Header: Authorization: Bearer {{token}}
```

---

## 🔐 Credenciales de Prueba

### Super Admin (Seed)
```
Email: admin@gymapp.com
Password: admin123
```

### Admin Gym (Después de crear un gym)
```
Email: admin@olimpo.com (o el que definas)
Password: password123 (o el que definas)
```

---

## ⚠️ Notas Importantes

1. **Token automático**: Al hacer login exitoso, el token se guarda automáticamente en `{{token}}`
2. **Autenticación**: Los endpoints de `/api/super-admin/*` requieren:
   - Header `Authorization: Bearer {{token}}`
   - Token de un super admin
3. **IDs dinámicos**: Reemplaza `:id` en las URLs con IDs reales de la base de datos
4. **Validación Zod**: Si envías datos incorrectos, recibirás errores descriptivos

---

## 🧪 Probar Validaciones

### Email inválido
```json
{
  "email": "invalid-email",
  "password": "admin123"
}
```
Respuesta: `422 Unprocessable Entity` con detalles del error

### Password muy corto
```json
{
  "email": "admin@gymapp.com",
  "password": "123"
}
```
Respuesta: `422 Unprocessable Entity` - "Password debe tener al menos 6 caracteres"

### Token inválido/expirado
```
Header: Authorization: Bearer token-invalido
```
Respuesta: `401 Unauthorized` - "Invalid or expired token"

---

## 📊 Endpoints Disponibles

### Auth (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login` | Login usuarios (super admin, admin, receptionist) |
| POST | `/login/member` | Login members por código |
| POST | `/refresh` | Refrescar token |
| POST | `/forgot-password` | Solicitar reset de password |
| POST | `/reset-password` | Cambiar password con token |

### Super Admin (`/api/super-admin`) 🔒
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard` | Métricas globales |
| GET | `/gyms` | Listar todos los gymnasios |
| POST | `/gyms` | Crear gimnasio + admin |
| GET | `/gyms/:id` | Ver detalle de gimnasio |
| PATCH | `/gyms/:id` | Actualizar gimnasio |
| POST | `/gyms/:id/toggle` | Activar/suspender gym |
| GET | `/invoices` | Listar facturas |
| POST | `/invoices/generate` | Generar facturas mensuales |

🔒 = Requiere autenticación

---

## 🐛 Troubleshooting

### "Backend no está corriendo"
```bash
cd backend
npm run dev
```

### "Invalid or expired token"
Haz login nuevamente para obtener un nuevo token

### "Unauthorized"
Verifica que:
1. Incluiste el header `Authorization: Bearer {{token}}`
2. El token no está expirado (7 días de validez)
3. Usas un super admin para endpoints de `/api/super-admin/*`

---

## 🎯 Próximos Endpoints (Fase 1.4+)

- `/api/members` - CRUD de clientes
- `/api/disciplines` - Disciplinas del gym
- `/api/pricing` - Planes de precios
- `/api/memberships` - Membresías
- `/api/attendances` - Asistencias por QR
- `/api/gyms/me` - Configuración del gym actual

---

**Happy Testing! 🎉**
