# Fase 1.6 - Frontend Admin Gym - Plan de Implementación

**Fecha:** 2026-01-22
**Estado:** 🚀 Listo para iniciar
**Tiempo estimado:** 1.5 semanas

---

## 📋 Resumen

Implementar el panel de administración completo para los dueños/admins de cada gimnasio. Este panel permite gestionar members, disciplinas, precios, membresías, asistencias y configuración del gym.

---

## 🎯 Objetivos

1. ✅ Layout Admin Gym con sidebar y navegación
2. ✅ Dashboard con métricas del gimnasio
3. ✅ Members CRUD completo con generación de QR
4. ✅ Disciplines CRUD
5. ✅ Pricing Plans CRUD
6. ✅ Memberships CRUD con registro de pagos
7. ✅ Attendances con lector QR
8. ✅ Configuración del gym

---

## 🏗️ Estructura a Crear

```
frontend/src/
├── pages/
│   └── admin-gym/
│       ├── dashboard/
│       │   └── index.tsx
│       ├── members/
│       │   ├── list.tsx
│       │   ├── create.tsx
│       │   ├── show.tsx
│       │   └── edit.tsx
│       ├── disciplines/
│       │   ├── list.tsx
│       │   └── create.tsx
│       ├── pricing/
│       │   ├── list.tsx
│       │   └── create.tsx
│       ├── memberships/
│       │   ├── list.tsx
│       │   ├── create.tsx
│       │   └── show.tsx
│       ├── attendances/
│       │   ├── list.tsx
│       │   └── scanner.tsx
│       └── settings/
│           └── index.tsx
├── components/
│   ├── layout/
│   │   └── AdminGymLayout.tsx
│   ├── members/
│   │   ├── MemberForm.tsx
│   │   ├── MemberCard.tsx
│   │   └── MemberQRCode.tsx
│   ├── memberships/
│   │   ├── MembershipForm.tsx
│   │   ├── PriceCalculator.tsx
│   │   └── PaymentForm.tsx
│   └── attendances/
│       ├── QRScanner.tsx
│       └── AttendanceList.tsx
└── utils/
    ├── qrGenerator.ts
    └── dateHelpers.ts
```

---

## 📦 Orden de Implementación

### Paso 1: Layout y Dashboard (2-3 horas)
**Archivos a crear:**
- `components/layout/AdminGymLayout.tsx`
- `pages/admin-gym/dashboard/index.tsx`

**Tareas:**
1. Crear AdminGymLayout con:
   - Sidebar con navegación (Dashboard, Miembros, Disciplinas, Precios, Membresías, Asistencias, Configuración)
   - Header con nombre del gym y usuario logueado
   - Logout button
2. Crear Dashboard con métricas:
   - Total miembros activos
   - Asistencias de hoy
   - Ingresos del mes
   - Membresías por vencer (7 días)
   - Lista de últimas asistencias

**Endpoints del backend a usar:**
- `GET /api/members` (filtrado por gymId automáticamente)
- `GET /api/attendances/today`
- `GET /api/memberships/expiring`

---

### Paso 2: Members CRUD (3-4 horas)
**Archivos a crear:**
- `pages/admin-gym/members/list.tsx`
- `pages/admin-gym/members/create.tsx`
- `pages/admin-gym/members/show.tsx`
- `pages/admin-gym/members/edit.tsx`
- `components/members/MemberForm.tsx`
- `components/members/MemberQRCode.tsx`

**Tareas:**
1. **List**: Tabla con búsqueda, filtros (activo/inactivo), acciones (ver, editar, desactivar)
2. **Create**: Formulario con validación (nombre, email, teléfono, disciplinas)
3. **Show**: Vista detallada con:
   - Datos del member
   - QR Code generado (con código)
   - Membresías activas/historial
   - Últimas asistencias
4. **Edit**: Actualizar datos del member

**Endpoints del backend:**
- `GET /api/members`
- `POST /api/members`
- `GET /api/members/:id`
- `PATCH /api/members/:id`
- `DELETE /api/members/:id`
- `GET /api/memberships/member/:memberId`
- `GET /api/attendances/member/:memberId`

**Librerías:**
- `react-qr-code` para generar QR

---

### Paso 3: Disciplines CRUD (1-2 horas)
**Archivos a crear:**
- `pages/admin-gym/disciplines/list.tsx`
- `pages/admin-gym/disciplines/create.tsx`

**Tareas:**
1. **List**: Tabla simple con nombre, descripción, acciones
2. **Create/Edit**: Modal con formulario (nombre, descripción)

**Endpoints del backend:**
- `GET /api/disciplines`
- `POST /api/disciplines`
- `PATCH /api/disciplines/:id`
- `DELETE /api/disciplines/:id`

---

### Paso 4: Pricing Plans CRUD (2-3 horas)
**Archivos a crear:**
- `pages/admin-gym/pricing/list.tsx`
- `pages/admin-gym/pricing/create.tsx`

**Tareas:**
1. **List**: Tabla con disciplina, personas, meses, precio
2. **Create**: Formulario:
   - Seleccionar disciplina
   - Cantidad de personas (1-10)
   - Cantidad de meses (1, 3, 6, 12)
   - Precio
3. Calculadora de precio (endpoint `/api/pricing/calculate`)

**Endpoints del backend:**
- `GET /api/pricing`
- `POST /api/pricing`
- `PATCH /api/pricing/:id`
- `DELETE /api/pricing/:id`
- `GET /api/pricing/calculate?disciplineId=X&numPeople=2&months=3`

---

### Paso 5: Memberships CRUD (3-4 horas)
**Archivos a crear:**
- `pages/admin-gym/memberships/list.tsx`
- `pages/admin-gym/memberships/create.tsx`
- `pages/admin-gym/memberships/show.tsx`
- `components/memberships/MembershipForm.tsx`
- `components/memberships/PriceCalculator.tsx`

**Tareas:**
1. **List**: Tabla con member, disciplina, fechas, estado
2. **Create**: Formulario:
   - Seleccionar member
   - Seleccionar disciplina
   - Cantidad de personas
   - Cantidad de meses
   - Precio calculado automáticamente
   - Método de pago
   - Fecha de inicio
3. **Show**: Detalle de membresía
4. **Renew**: Botón para renovar membresía

**Endpoints del backend:**
- `GET /api/memberships`
- `POST /api/memberships`
- `GET /api/memberships/:id`
- `POST /api/memberships/:id/renew`
- `GET /api/memberships/expiring`

---

### Paso 6: Attendances + QR Scanner (3-4 horas)
**Archivos a crear:**
- `pages/admin-gym/attendances/list.tsx`
- `pages/admin-gym/attendances/scanner.tsx`
- `components/attendances/QRScanner.tsx`
- `components/attendances/AttendanceList.tsx`

**Tareas:**
1. **List**: Tabla con fecha, member, hora
2. **Scanner**:
   - Activar cámara
   - Escanear QR
   - Decodificar código del member
   - Buscar member por código
   - Verificar membresía activa
   - Registrar asistencia
   - Mostrar alerta si membresía por vencer

**Endpoints del backend:**
- `GET /api/attendances`
- `POST /api/attendances`
- `GET /api/attendances/today`
- `GET /api/members/code/:code`

**Librerías:**
- `html5-qrcode` para scanner

---

### Paso 7: Settings (1-2 horas)
**Archivos a crear:**
- `pages/admin-gym/settings/index.tsx`

**Tareas:**
1. Ver info del gym actual
2. Editar configuración básica
3. Cambiar contraseña

**Endpoints del backend:**
- `GET /api/gyms/me` (pendiente implementar en backend)
- `PATCH /api/gyms/me` (pendiente implementar en backend)

---

## 🔧 Utilidades a Crear

### `utils/qrGenerator.ts`
```typescript
export const generateMemberQRData = (code: string, gymId: string) => {
  return JSON.stringify({ code, gymId, type: 'member' });
};
```

### `utils/dateHelpers.ts`
```typescript
export const formatDate = (date: Date | string) => { ... }
export const getDaysRemaining = (endDate: Date) => { ... }
export const isExpiringSoon = (endDate: Date, days: number) => { ... }
```

---

## 🎨 Componentes UI a Reutilizar

Ya tenemos creados:
- ✅ `Button.tsx`
- ✅ `Card.tsx`
- ✅ `Input.tsx`

Falta crear:
- `Table.tsx` - Tabla reutilizable
- `Modal.tsx` - Modal genérico
- `Select.tsx` - Select estilizado
- `Badge.tsx` - Para estados (activo, inactivo, por vencer)
- `Alert.tsx` - Para mensajes de éxito/error

---

## 🔐 Autenticación y Permisos

- Usar `authProvider.check()` para proteger rutas
- Verificar que el usuario tenga role = 'admin' o 'receptionist'
- El `gymId` se extrae del token JWT (middleware backend)
- Todas las queries automáticamente filtran por gymId

---

## 📝 Convenciones

- **Nombres de archivos**: kebab-case para páginas, PascalCase para componentes
- **Código**: inglés
- **UI**: español
- **Rutas**: `/admin-gym/members`, `/admin-gym/dashboard`, etc.

---

## ✅ Checklist de Implementación

### Paso 1: Layout y Dashboard
- [ ] AdminGymLayout.tsx
- [ ] Dashboard con métricas

### Paso 2: Members CRUD
- [ ] List
- [ ] Create
- [ ] Show con QR
- [ ] Edit

### Paso 3: Disciplines
- [ ] List
- [ ] Create/Edit

### Paso 4: Pricing
- [ ] List
- [ ] Create con calculadora

### Paso 5: Memberships
- [ ] List
- [ ] Create con calculadora
- [ ] Show
- [ ] Renew

### Paso 6: Attendances
- [ ] List
- [ ] QR Scanner

### Paso 7: Settings
- [ ] Configuración del gym

### Paso 8: Integración
- [ ] Actualizar App.tsx con rutas
- [ ] Probar flujo completo

---

## 🚀 ¿Listo para empezar?

Vamos a implementar paso a paso, comenzando por el **Layout y Dashboard**.
