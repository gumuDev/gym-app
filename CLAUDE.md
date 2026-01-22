# GymApp - Contexto del Proyecto

## 📋 Descripción
Sistema SaaS multi-gimnasio para gestión de clientes, membresías, asistencias por QR, progreso físico y notificaciones automatizadas.

## 🎯 Fase Actual
> **FASE 1** - MVP + Super Admin
> Ver tareas detalladas en: `docs/FASE-1.md`

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + Vite + TypeScript
- Refine (Headless) para CRUD/Admin
- TailwindCSS para estilos
- Axios para HTTP requests
- React Query (incluido en Refine)
- react-qr-code + html5-qrcode

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- JWT para autenticación
- Zod para validación
- bcrypt para passwords
- node-cron para tareas programadas

### Base de Datos
- PostgreSQL (Supabase inicialmente)

### Storage
- Cloudinary para imágenes

## 📁 Estructura del Proyecto
```
gym-app/
├── frontend/          # React + Refine
├── backend/           # Node.js + Express
├── docs/              # Documentación y fases
└── CLAUDE.md          # Este archivo
```

## 📐 Convenciones de Código

### Idioma
| Elemento | Idioma |
|----------|--------|
| Tablas BD | Inglés (snake_case) |
| Variables/Funciones | Inglés (camelCase) |
| Componentes React | Inglés (PascalCase) |
| UI/Textos visibles | **Español** |

### Ejemplos
```typescript
// ✅ Correcto
const getMemberById = async (id: string) => { }
<MemberList />
"Registrar Cliente"

// ❌ Incorrecto
const obtenerClientePorId = async (id: string) => { }
<ListaClientes />
"Register Client"
```

### Estructura de archivos Backend
```
backend/src/
├── routes/        → nombreRecurso.routes.ts
├── controllers/   → nombreRecurso.controller.ts
├── services/      → nombreRecurso.service.ts
├── middlewares/   → nombreFuncion.middleware.ts
└── validators/    → nombreRecurso.validator.ts
```

### Estructura de archivos Frontend
```
frontend/src/
├── pages/         → kebab-case (my-membership/)
├── components/    → PascalCase (MemberForm.tsx)
├── hooks/         → camelCase (useMember.ts)
└── utils/         → camelCase (formatDate.ts)
```

## 🏗️ Arquitectura Multi-Tenant

Todos los datos están aislados por `gym_id`:
- Cada query debe filtrar por gym_id
- El middleware `gym.middleware.ts` extrae gym_id del JWT
- Nunca exponer datos de un gym a otro

## 🔐 Autenticación

### Tipos de Usuario
| Tipo | Login | Token contiene |
|------|-------|----------------|
| Super Admin | email + password | `{ role: 'super_admin' }` |
| Admin Gym | email + password | `{ role: 'admin', gymId }` |
| Recepcionista | email + password | `{ role: 'receptionist', gymId }` |
| Member (Cliente) | código (GYM-001) | `{ role: 'member', gymId, memberId }` |

## 📚 Documentación

- **Análisis completo:** `docs/gym-olimpo-analisis.md`
- **Fase actual:** `docs/FASE-1.md`
- **Todas las fases:** `docs/FASE-[1-5].md`

## ⚠️ Reglas Importantes

1. **NO usar Supabase Auth** - Usamos JWT propio
2. **NO usar Supabase Functions** - Usamos Express
3. **NO crear archivos en español** - Solo UI en español
4. **SIEMPRE** validar con Zod antes de procesar requests
5. **SIEMPRE** usar transacciones Prisma para operaciones múltiples
6. **SIEMPRE** registrar errores con contexto suficiente

## 🚀 Comandos Útiles

```bash
# Desarrollo
cd frontend && npm run dev    # Frontend en localhost:5173
cd backend && npm run dev     # Backend en localhost:3000

# Base de datos
cd backend && npx prisma migrate dev    # Crear migración
cd backend && npx prisma studio         # Ver BD visual

# Build
cd frontend && npm run build
cd backend && npm run build
```

## 📝 Notas para Claude Code

1. Lee `docs/FASE-X.md` para ver las tareas actuales
2. Marca las tareas completadas con [x]
3. El documento `docs/gym-olimpo-analisis.md` tiene todos los detalles
4. Pregunta si algo no está claro antes de implementar
