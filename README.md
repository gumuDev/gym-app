# 🏋️ GymApp - Sistema de Gestión Multi-Gimnasio

Sistema SaaS multi-tenant para la gestión integral de gimnasios, incluyendo administración de clientes, membresías, control de asistencias por QR, seguimiento de progreso físico y notificaciones automatizadas.

## 🎯 Características Principales

- **Multi-tenant**: Soporte para múltiples gimnasios con aislamiento completo de datos
- **Gestión de Clientes**: Registro y administración de miembros con perfiles completos
- **Membresías**: Sistema flexible de planes y suscripciones
- **Control de Acceso**: Registro de asistencias mediante códigos QR
- **Seguimiento de Progreso**: Mediciones y fotos de progreso físico
- **Notificaciones**: Alertas automatizadas para vencimientos y recordatorios
- **Roles de Usuario**: Super Admin, Admin de Gimnasio, Recepcionista y Miembro

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite
- Refine (Framework headless para admin)
- TailwindCSS
- React Query
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod (Validación)
- bcrypt
- node-cron

### Servicios
- **Base de Datos**: PostgreSQL (Supabase)
- **Storage**: Cloudinary (imágenes)

## 📁 Estructura del Proyecto

```
gym-app/
├── frontend/          # Aplicación React
├── backend/           # API REST con Express
├── docs/              # Documentación del proyecto
├── CLAUDE.md          # Guía para desarrollo con IA
└── README.md          # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run dev
```

## 🔐 Autenticación

El sistema maneja 4 tipos de usuarios con diferentes niveles de acceso:

| Rol | Método de Login | Permisos |
|-----|----------------|----------|
| **Super Admin** | Email + Password | Gestión global de todos los gimnasios |
| **Admin Gym** | Email + Password | Gestión completa de su gimnasio |
| **Recepcionista** | Email + Password | Registro de asistencias y consultas |
| **Member** | Código único (ej: GYM-001) | Acceso a su perfil y progreso |

## 📐 Convenciones de Código

- **Código fuente**: Inglés (variables, funciones, nombres de archivos)
- **Interfaz de usuario**: Español (textos visibles para usuarios)
- **Base de datos**: Inglés con snake_case
- **Componentes React**: PascalCase
- **Funciones**: camelCase

## 🏗️ Arquitectura Multi-Tenant

Todos los datos están aislados por `gym_id`:
- Cada consulta filtra automáticamente por gimnasio
- Middleware de autenticación extrae `gym_id` del JWT
- Cero posibilidad de filtración de datos entre gimnasios

## 📚 Documentación

- **CLAUDE.md**: Guía completa para desarrollo con IA
- **docs/FASE-[1-5].md**: Plan de desarrollo por fases
- **docs/gym-olimpo-analisis.md**: Análisis detallado del dominio (privado)

## 🗓️ Roadmap

- **Fase 1**: MVP + Panel Super Admin ✅ (En desarrollo)
- **Fase 2**: Panel Admin Gimnasio + Recepcionista
- **Fase 3**: App Móvil para Miembros
- **Fase 4**: Reportes y Analíticas
- **Fase 5**: Integraciones y Optimizaciones

## 🤝 Contribución

Este es un proyecto privado. Para colaborar, contacta al propietario del repositorio.

## 📄 Licencia

Propietario: gumuDev
Todos los derechos reservados.

---

**Desarrollado con ❤️ para la gestión moderna de gimnasios**
