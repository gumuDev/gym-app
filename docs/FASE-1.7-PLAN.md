# 📱 Fase 1.7 - Frontend App Cliente

**Objetivo:** Crear una aplicación mobile-first para que los **clientes/members** del gym puedan ver su información, QR, membresía y asistencias.

**Duración estimada:** 1 semana
**Estado:** 🚀 Iniciando

---

## 🎯 Características Principales

### Para el Cliente (Member):
- 📱 Login con código de member (GYM-001) o teléfono
- 🎫 Ver su QR code para marcar asistencia
- 📊 Ver estado de su membresía (activa/vencida, días restantes)
- 📅 Ver calendario de asistencias
- 🔥 Ver racha de asistencias consecutivas
- 👤 Ver su perfil (datos personales)

---

## 📐 Arquitectura

### Rutas del Cliente
```
/client/login              → Login con código o teléfono
/client/dashboard          → Dashboard con resumen (opcional)
/client/my-qr              → Mi código QR grande
/client/my-membership      → Estado de mi membresía
/client/my-attendances     → Mis asistencias (calendario + racha)
/client/profile            → Mi perfil
```

### Navegación
**Bottom Navigation Bar** (4 opciones):
1. 🎫 **Mi QR** - Pantalla principal
2. 💳 **Membresía** - Estado y días restantes
3. 📅 **Asistencias** - Calendario y estadísticas
4. 👤 **Perfil** - Datos personales

---

## 📋 Plan de Implementación

### Paso 1: Configuración y Rutas (30 min)
- [ ] Actualizar `App.tsx` con rutas de cliente
- [ ] Extender `authProvider.ts` para soportar login de member
- [ ] Crear protección de rutas para role='member'

### Paso 2: ClientLayout (1 hora)
- [ ] Crear `components/layout/ClientLayout.tsx`
- [ ] Bottom navigation bar con 4 opciones
- [ ] Diseño mobile-first (max-width: 480px)
- [ ] Header simple con logo del gym y logout
- [ ] Estilo consistente (verde para cliente vs azul admin)

### Paso 3: Login de Cliente (1.5 horas)
- [ ] Crear `pages/client/login/index.tsx`
- [ ] Formulario con opción código O teléfono
- [ ] Validación y llamada a `/api/auth/login/member`
- [ ] Redirección a `/client/my-qr` después del login
- [ ] Manejo de errores (código inválido, member inactivo)

### Paso 4: Mi QR (1 hora)
- [ ] Crear `pages/client/my-qr/index.tsx`
- [ ] Mostrar QR code grande (react-qr-code)
- [ ] Mostrar nombre y código del member
- [ ] Mensaje: "Muestra este código al llegar al gym"
- [ ] Opción de aumentar brillo de pantalla (CSS)

### Paso 5: Mi Membresía (2 horas)
- [ ] Crear `pages/client/my-membership/index.tsx`
- [ ] Llamar a `/api/memberships/member/:memberId`
- [ ] Mostrar membresía activa (si existe):
  - Estado: Activa/Vencida
  - Disciplina
  - Fecha de inicio y fin
  - Días restantes (con barra de progreso)
  - Alerta si está por vencer (≤7 días)
- [ ] Mensaje si no tiene membresía activa
- [ ] Card con información del plan actual

### Paso 6: Mis Asistencias (3 horas)
- [ ] Crear `pages/client/my-attendances/index.tsx`
- [ ] Llamar a `/api/attendances/member/:memberId`
- [ ] Estadísticas principales (cards):
  - Total de asistencias del mes
  - Racha actual (días consecutivos)
  - Última asistencia
- [ ] Calendario visual simple (tabla 7x5)
- [ ] Marcar días con asistencia (✅)
- [ ] Filtro por mes

### Paso 7: Mi Perfil (1.5 horas)
- [ ] Crear `pages/client/profile/index.tsx`
- [ ] Mostrar datos del member (solo lectura):
  - Foto (si existe)
  - Nombre
  - Código
  - Teléfono
  - Email
  - Fecha de nacimiento
  - Dirección
  - Contacto de emergencia
- [ ] Botón de Logout
- [ ] (Opcional) Botón "Solicitar cambio de datos"

---

## 🎨 Diseño Visual

### Paleta de Colores (Cliente)
```css
/* Verde para Cliente (diferente del verde Admin) */
--client-primary: #10b981     /* green-500 */
--client-dark: #059669        /* green-600 */
--client-light: #d1fae5       /* green-100 */
--client-bg: #f0fdf4          /* green-50 */
```

### Layout Mobile-First
```tsx
// Contenedor principal
max-width: 480px
margin: 0 auto
background: white
min-height: 100vh

// Bottom navigation
fixed bottom-0
height: 64px
4 botones iguales
Icono + texto
```

### Componentes a Crear
```
frontend/src/
├── components/
│   └── layout/
│       └── ClientLayout.tsx        # Nuevo
├── pages/
│   └── client/                     # Nueva carpeta
│       ├── login/
│       │   └── index.tsx
│       ├── my-qr/
│       │   └── index.tsx
│       ├── my-membership/
│       │   └── index.tsx
│       ├── my-attendances/
│       │   └── index.tsx
│       └── profile/
│           └── index.tsx
```

---

## 🔌 Endpoints Backend (Ya Existentes)

### Auth
- `POST /api/auth/login/member` - Login con código o teléfono

### Members
- `GET /api/members/code/:code` - Info del member por código
- `GET /api/members/:id` - Info del member por ID

### Memberships
- `GET /api/memberships/member/:memberId` - Membresías del member

### Attendances
- `GET /api/attendances/member/:memberId` - Asistencias del member

---

## ✅ Criterios de Aceptación

### Login
- [ ] Member puede entrar con código (GYM-001)
- [ ] Member puede entrar con teléfono
- [ ] Se valida que el member esté activo
- [ ] Token JWT se guarda correctamente

### Mi QR
- [ ] QR se muestra grande y centrado
- [ ] Contiene el código del member
- [ ] Es escaneable por el scanner del admin

### Mi Membresía
- [ ] Muestra si tiene membresía activa o no
- [ ] Calcula correctamente días restantes
- [ ] Alerta si está por vencer
- [ ] Muestra disciplina y fechas

### Mis Asistencias
- [ ] Lista las asistencias del member
- [ ] Calcula racha correctamente
- [ ] Muestra calendario visual
- [ ] Filtra por mes

### Mi Perfil
- [ ] Muestra todos los datos del member
- [ ] Logout funciona correctamente

---

## 📱 Responsive

Como es **mobile-first**, el diseño se optimiza para:
- 📱 **Mobile (default):** 320px - 480px (diseño principal)
- 📱 **Tablet:** 481px - 768px (mismo diseño, más espaciado)
- 💻 **Desktop:** >768px (contenedor centrado con max-width: 480px)

---

## 🚀 Testing Manual

### Preparación
1. Tener un member creado con código (ej: GYM-001)
2. Tener membresía activa para ese member
3. Tener algunas asistencias registradas

### Flujo Completo
1. Login con código → ✅ Redirige a Mi QR
2. Ver QR → ✅ QR es escaneable
3. Ver Membresía → ✅ Muestra días restantes
4. Ver Asistencias → ✅ Muestra calendario
5. Ver Perfil → ✅ Muestra datos
6. Logout → ✅ Redirige a login

---

## 📝 Notas Importantes

### Autenticación
- El token JWT para members contiene: `{ role: 'member', gymId, memberId }`
- Las rutas del cliente NO usan el middleware `gym.middleware.ts`
- Las rutas del cliente usan `auth.middleware.ts` + validación de role='member'

### Diseño
- **NO** usar el mismo layout que admin (sin sidebar)
- Usar bottom navigation (estándar mobile)
- Colores verdes (diferente al azul de admin)
- Máximo 480px de ancho (centrado en desktop)

### Funcionalidades Futuras (No en esta fase)
- Editar perfil
- Renovar membresía desde la app
- Chat con el gym
- Reservar clases

---

## 🎯 Próximo Paso

**Comenzar con Paso 1:** Configuración y Rutas (30 min)

¿Listo para empezar?
