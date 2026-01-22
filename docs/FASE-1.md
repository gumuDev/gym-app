# Fase 1: MVP + Super Admin

**Duración estimada:** 7-9 semanas  
**Estado:** 🔄 En progreso

---

## 1.1 Setup Inicial (4-5 días)

### Estructura del Proyecto
- [x] Crear carpeta `gym-app/` con estructura monorepo
- [x] Crear `frontend/` con Vite + React + TypeScript
- [x] Crear `backend/` con Node.js + Express + TypeScript
- [x] Configurar TailwindCSS en frontend
- [x] Crear `docker-compose.yml` para PostgreSQL local
- [x] Configurar archivos `.env.example` en ambos proyectos
- [x] Configurar ESLint y Prettier en ambos proyectos
- [x] Crear `.gitignore` apropiado

### Frontend Setup
- [x] Instalar Refine con data provider REST
- [ ] Configurar Axios instance con interceptors
- [ ] Configurar React Router
- [ ] Crear estructura de carpetas (pages, components, hooks, utils)
- [ ] Crear componentes UI base (Button, Input, Card, Modal)

### Backend Setup
- [x] Configurar Express con TypeScript
- [ ] Configurar Prisma ORM
- [x] Crear estructura de carpetas (routes, controllers, services, middlewares)
- [x] Configurar CORS, JSON parsing, error handling
- [ ] Crear utilidades (jwt.ts, hash.ts, response helpers)

---

## 1.2 Backend - Base de Datos (1 semana)

### Prisma Schema
- [x] Crear modelo `SuperAdmin`
- [x] Crear modelo `SaasConfig`
- [x] Crear modelo `Gym`
- [x] Crear modelo `User`
- [x] Crear modelo `Member`
- [x] Crear modelo `Discipline`
- [x] Crear modelo `PricingPlan`
- [x] Crear modelo `Membership`
- [x] Crear modelo `Attendance`
- [x] Crear modelo `NotificationLog`
- [x] Crear modelo `GymInvoice`
- [x] Ejecutar primera migración
- [x] Crear seed con super admin inicial

### Middlewares
- [x] `auth.middleware.ts` - Verificar JWT
- [x] `superAdmin.middleware.ts` - Solo super admin
- [x] `gym.middleware.ts` - Extraer gymId y filtrar
- [x] `role.middleware.ts` - Verificar roles permitidos
- [x] `validate.middleware.ts` - Validar con Zod
- [x] `error.middleware.ts` - Manejo global de errores

### Utilidades
- [x] `jwt.ts` - Generar y verificar tokens
- [x] `hash.ts` - Hash y compare passwords
- [x] `codeGenerator.ts` - Generar códigos GYM-001
- [x] `responseHelpers.ts` - Respuestas consistentes

---

## 1.3 Backend - Auth y Super Admin (1 semana)

### Auth Routes `/api/auth`
- [ ] `POST /login` - Login super admin y gym users
- [ ] `POST /login/member` - Login member por código
- [ ] `POST /refresh` - Refrescar token
- [ ] `POST /forgot-password` - Solicitar reset
- [ ] `POST /reset-password` - Cambiar password

### Auth Service
- [ ] Validar credenciales
- [ ] Generar JWT con datos correctos según rol
- [ ] Manejar refresh tokens
- [ ] Generar tokens de reset password
- [ ] Enviar emails de reset

### Super Admin Routes `/api/super-admin`
- [ ] `GET /dashboard` - Métricas globales (gyms, members, MRR)
- [ ] `GET /gyms` - Listar todos los gyms
- [ ] `POST /gyms` - Crear gym + usuario admin
- [ ] `GET /gyms/:id` - Detalle de un gym
- [ ] `PATCH /gyms/:id` - Actualizar gym
- [ ] `POST /gyms/:id/toggle` - Activar/suspender gym
- [ ] `GET /invoices` - Ver facturas
- [ ] `POST /invoices/generate` - Generar facturas mensuales

### Email Service
- [ ] Configurar Resend/Nodemailer
- [ ] Template: Credenciales nuevo gym
- [ ] Template: Reset password
- [ ] Función enviar email genérica

---

## 1.4 Backend - Admin Gym Core (1 semana)

### Members Routes `/api/members`
- [ ] `GET /` - Listar members del gym
- [ ] `POST /` - Crear member (genera código automático)
- [ ] `GET /:id` - Detalle de member
- [ ] `PATCH /:id` - Actualizar member
- [ ] `DELETE /:id` - Desactivar member
- [ ] `GET /code/:code` - Buscar por código (para QR)

### Disciplines Routes `/api/disciplines`
- [ ] `GET /` - Listar disciplinas
- [ ] `POST /` - Crear disciplina
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Desactivar

### Pricing Routes `/api/pricing`
- [ ] `GET /` - Listar planes de precios
- [ ] `POST /` - Crear plan
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Eliminar
- [ ] `GET /calculate` - Calcular precio (personas, meses)

### Memberships Routes `/api/memberships`
- [ ] `GET /` - Listar membresías
- [ ] `POST /` - Crear membresía (registrar pago)
- [ ] `GET /:id` - Detalle
- [ ] `GET /member/:memberId` - Membresías de un member
- [ ] `GET /expiring` - Por vencer (7 días)
- [ ] `POST /:id/renew` - Renovar membresía

### Attendances Routes `/api/attendances`
- [ ] `POST /` - Registrar asistencia (scan QR)
- [ ] `GET /` - Listar asistencias
- [ ] `GET /member/:memberId` - Asistencias de un member
- [ ] `GET /today` - Asistencias de hoy

### Gym Routes `/api/gyms`
- [ ] `GET /me` - Info del gym actual
- [ ] `PATCH /me` - Actualizar configuración
- [ ] `POST /me/complete-setup` - Marcar setup completado

### Users Routes `/api/users`
- [ ] `GET /` - Listar usuarios del gym
- [ ] `POST /` - Crear usuario (recepcionista, entrenador)
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Desactivar

---

## 1.5 Frontend - Super Admin (1 semana)

### Configuración
- [ ] Crear `authProvider.ts` para Refine
- [ ] Crear `dataProvider.ts` para llamar a la API
- [ ] Configurar rutas protegidas

### Layout
- [ ] `SuperAdminLayout.tsx` con sidebar
- [ ] Sidebar con navegación
- [ ] Header con usuario y logout

### Páginas
- [ ] `Login` - Formulario de login
- [ ] `Dashboard` - Cards con métricas globales
- [ ] `Gyms/List` - Tabla de gimnasios
- [ ] `Gyms/Create` - Formulario crear gym + admin
- [ ] `Gyms/Show` - Detalle de gym con stats
- [ ] `Gyms/Edit` - Editar gym
- [ ] `Invoices/List` - Lista de facturas

### Funcionalidades
- [ ] Toggle activar/suspender gym
- [ ] Enviar credenciales por email
- [ ] Filtros y búsqueda en tablas

---

## 1.6 Frontend - Admin Gym (1.5 semanas)

### Configuración
- [ ] Login con slug del gym (`/[slug]/admin/login`)
- [ ] Detectar gymId desde URL
- [ ] Rutas protegidas por rol

### Setup Wizard (primer ingreso)
- [ ] Paso 1: Cambiar contraseña
- [ ] Paso 2: Seleccionar disciplinas
- [ ] Paso 3: Configurar precios
- [ ] Paso 4: Telegram (opcional)
- [ ] Marcar setup completado

### Layout
- [ ] `AdminLayout.tsx` con sidebar
- [ ] Sidebar con navegación completa
- [ ] Header con gym name y usuario

### Dashboard
- [ ] Card: Members activos
- [ ] Card: Asistencias hoy
- [ ] Card: Ingresos del mes
- [ ] Card: Por vencer (7 días)
- [ ] Lista: Últimas asistencias

### Members (CRUD completo)
- [ ] Lista con búsqueda y filtros
- [ ] Crear member (formulario)
- [ ] Ver detalle con membresías
- [ ] Editar member
- [ ] Desactivar member

### Disciplines
- [ ] Lista de disciplinas
- [ ] Crear/Editar disciplina

### Pricing
- [ ] Configurar precios por disciplina
- [ ] Precios por cantidad de personas
- [ ] Precios por cantidad de meses

### Memberships
- [ ] Registrar nueva membresía (pago)
- [ ] Calculadora de precio automática
- [ ] Renovar membresía existente
- [ ] Ver historial por member

### QR Scanner
- [ ] Página con cámara activa
- [ ] Escanear QR del member
- [ ] Mostrar info del member
- [ ] Registrar asistencia
- [ ] Alerta si membresía por vencer

### Users
- [ ] Lista de usuarios del gym
- [ ] Crear recepcionista/entrenador
- [ ] Editar/Desactivar

---

## 1.7 Frontend - App Cliente (1 semana)

### Configuración
- [ ] Login con código (`/[slug]/client`)
- [ ] Rutas protegidas para members
- [ ] Layout mobile-first

### Layout
- [ ] `ClientLayout.tsx` con nav inferior
- [ ] Navegación: QR, Membresía, Asistencias, Perfil

### Páginas
- [ ] `Login` - Ingresar código o teléfono
- [ ] `MyQR` - Mostrar QR grande para escanear
- [ ] `MyMembership` - Estado, días restantes, disciplina
- [ ] `MyAttendances` - Calendario, racha, stats
- [ ] `Profile` - Ver mis datos

### Funcionalidades
- [ ] QR se genera con el código del member
- [ ] Mostrar días restantes de membresía
- [ ] Calendario visual de asistencias
- [ ] Contador de racha

---

## 1.8 Notificaciones Telegram (3-5 días)

### Backend
- [ ] Crear `telegram.service.ts`
- [ ] Configurar bot con Telegraf
- [ ] Comando `/start` para vincular member
- [ ] Función enviar mensaje a chat_id
- [ ] Guardar en `NotificationLog`

### Cron Job
- [ ] Crear `notifications.job.ts`
- [ ] Configurar cron diario (8am)
- [ ] Buscar membresías que vencen en 7, 3, 0 días
- [ ] Enviar mensajes correspondientes

### Mensajes
- [ ] Bienvenida al registrarse
- [ ] Recordatorio 7 días
- [ ] Recordatorio 3 días
- [ ] Aviso de vencimiento

---

## ✅ Criterios de Completado Fase 1

- [ ] Super Admin puede crear gyms y ver métricas
- [ ] Admin puede gestionar members y membresías
- [ ] QR Scanner funciona y registra asistencias
- [ ] Members pueden ver su QR y estado
- [ ] Notificaciones Telegram funcionan
- [ ] Deploy en Railway + Vercel funcionando

---

## 📝 Notas

- Priorizar funcionalidad sobre diseño perfecto
- Probar con Gym Olimpo como primer cliente
- Documentar cualquier decisión técnica importante
