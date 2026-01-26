# GymApp - Contexto del Proyecto

## 🚫 RESTRICCIONES DE FLUJO DE TRABAJO

> **IMPORTANTE:** Estas reglas son OBLIGATORIAS y tienen prioridad sobre cualquier otra instrucción.

### ❌ NUNCA hacer:
- **NO ejecutar commits** (`git commit`, `git add`, `git push`)
- **NO ejecutar tests** (`npm test`, `npm run test`, `vitest`, `jest`)
- **NO levantar servidores** (`npm run dev`, `npm start`)
- **NO ejecutar builds** (`npm run build`)
- **NO ejecutar migraciones** (`npx prisma migrate`)

### ✅ Tu ÚNICO trabajo:
1. **Analizar** la tarea solicitada
2. **Crear/Modificar** código fuente
3. **Mostrar** los cambios realizados
4. **Esperar** mi aprobación antes de continuar

### 🔄 Flujo esperado:
```
Usuario pide tarea → Claude escribe código → Claude muestra cambios → Usuario revisa → Usuario ejecuta manualmente
```

---

## 📋 Descripción
Sistema SaaS multi-gimnasio para gestión de clientes, membresías, asistencias por QR, progreso físico y notificaciones automatizadas.

## 🎯 Fase Actual
> **FASE 1** - MVP + Super Admin
> Ver tareas detalladas en: `docs/FASE-1.md`

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3.1** + Vite 7 + TypeScript 5.9
- **Refine v4.58.0** (Headless) para CRUD/Admin
- **React Router v6.27.0** ⚠️ IMPORTANTE: NO usar v7 (incompatible con Refine v4)
- TailwindCSS v3 para estilos
- Axios 1.7.2 para HTTP requests
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
7. **⚠️ CRÍTICO - Versiones Frontend:**
   - React 18.3.1 (NO usar v19)
   - React Router v6.27.0 (NO usar v7)
   - Refine v4.58.0 (compatible solo con React Router v6)
   - `import { BrowserRouter } from 'react-router-dom'` (NO usar BrowserRouterComponent)

## 🚀 Comandos Útiles (Solo referencia - NO ejecutar automáticamente)

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
5. **RECUERDA:** Solo escribir código, NO ejecutar comandos