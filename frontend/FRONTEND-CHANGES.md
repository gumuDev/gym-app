# Cambios en Frontend - Membresías Grupales

## Resumen

Se ha comenzado la actualización del frontend para soportar **membresías grupales**, permitiendo la creación y gestión de membresías compartidas por múltiples miembros.

---

## 📁 Archivos Creados

### 1. **Tipos TypeScript** (`frontend/src/types/membership.ts`)

Definiciones completas de tipos para membresías grupales:

**Tipos principales:**
- ✅ `Member` - Información del miembro
- ✅ `Discipline` - Disciplina deportiva
- ✅ `PricingPlan` - Plan de precios
- ✅ `MembershipMember` - Relación miembro-membresía (tabla intermedia)
- ✅ `Membership` - Membresía completa con soporte grupal
- ✅ `CreateGroupMembershipPayload` - Payload para crear membresía grupal
- ✅ `RenewGroupMembershipPayload` - Payload para renovar membresía grupal
- ✅ `MembershipStats` - Estadísticas
- ✅ `MemberSelectionItem` - Helper para selección de miembros en UI

**Compatibilidad:**
- Mantiene campos antiguos (`member_id`, `amount_paid`) opcionales
- Soporta estructura antigua y nueva simultáneamente

---

### 2. **Servicio de API** (`frontend/src/services/membershipService.ts`)

Funciones helper para todas las operaciones con membresías:

#### Endpoints Implementados:

| Función | Endpoint | Descripción |
|---------|----------|-------------|
| `getAllMemberships()` | GET `/memberships` | Obtener todas las membresías |
| `getMembershipById()` | GET `/memberships/:id` | Obtener una membresía |
| `getMembershipsByMember()` | GET `/memberships/member/:id` | Membresías de un miembro |
| `getActiveMembershipByMember()` | GET `/memberships/member/:id/active` | Membresía activa |
| `getExpiringMemberships()` | GET `/memberships/expiring` | Próximas a vencer |
| `getMembershipStats()` | GET `/memberships/stats` | Estadísticas |
| `createMembership()` | POST `/memberships` | Crear individual |
| `createGroupMembership()` | POST `/memberships/group` | **Crear grupal** |
| `renewMembership()` | POST `/memberships/:id/renew` | Renovar simple |
| `renewGroupMembership()` | POST `/memberships/:id/renew-group` | **Renovar grupal** |
| `cancelMembership()` | DELETE `/memberships/:id/cancel` | Cancelar |

#### Utilidades:

- ✅ `calculateEndDate()` - Calcular fecha de vencimiento
- ✅ `isMembershipActive()` - Verificar si está activa
- ✅ `getDaysRemaining()` - Días restantes
- ✅ `isExpiringSoon()` - Verificar si vence pronto
- ✅ `getPrimaryMember()` - Obtener miembro titular
- ✅ `getSecondaryMembers()` - Obtener miembros secundarios
- ✅ `isGroupMembership()` - Verificar si es grupal
- ✅ `getMemberCount()` - Contar miembros
- ✅ `formatPrice()` - Formatear precio

---

### 3. **Componente de Creación Grupal** (`frontend/src/pages/admin-gym/memberships/create-group.tsx`)

Nuevo formulario paso a paso para crear membresías grupales.

#### Flujo de Pasos:

```
1. Seleccionar Disciplina
   ↓
2. Seleccionar Plan (según num_people)
   ↓
3. Seleccionar Miembros (cantidad exacta del plan)
   ↓
4. Confirmar y Pagar
```

#### Características:

**Paso 1: Disciplina**
- Muestra todas las disciplinas activas
- UI tipo tarjetas grandes

**Paso 2: Plan**
- Filtra planes por disciplina seleccionada
- Muestra: duración, cantidad de personas, precio
- Destaca precio por persona

**Paso 3: Selección de Miembros**
- ✅ Contador de progreso: "2/2 miembros seleccionados"
- ✅ Búsqueda en tiempo real (nombre, código, teléfono)
- ✅ Miembros seleccionados visibles con badge "⭐ Titular"
- ✅ Opción de cambiar titular
- ✅ Validación: cantidad exacta según plan
- ✅ No permite duplicados
- ✅ Primer miembro seleccionado = titular automático

**Paso 4: Confirmación**
- Selección de método de pago (QR/Efectivo)
- Campo de notas opcional
- Resumen completo:
  - Disciplina
  - Plan y duración
  - Lista de miembros con indicador de titular
  - Fechas inicio/vencimiento
  - Total calculado (precio × cantidad)

#### Validaciones:

- ✅ Cantidad de miembros = `num_people` del plan
- ✅ Al menos un miembro es titular
- ✅ Todos los campos requeridos completados
- ✅ Mensajes de error claros

---

## 🎨 Diseño UI/UX

### Indicador de Progreso

```
[1] ──────── [2] ──────── [3] ──────── [4]
Disciplina    Plan      Miembros   Confirmar
```

- Paso actual: azul
- Pasos completados: verde
- Pasos pendientes: gris

### Miembro Seleccionado

```
┌────────────────────────────────────────┐
│ Juan Pérez  ⭐ Titular                 │
│ MEM-0001              [Hacer titular] ✕│
└────────────────────────────────────────┘
```

### Resumen Final

```
┌─────────────────────────────────────────────┐
│ Resumen de la membresía grupal:             │
├─────────────────────────────────────────────┤
│ Disciplina: Musculación                     │
│ Plan: 1 mes - 2 persona(s)                  │
│ Miembros:                                   │
│   • Juan Pérez (Titular)                    │
│   • María López                             │
│ Método de Pago: Efectivo                    │
│ Inicio: Hoy (29/01/2026)                    │
│ Vencimiento: 28/02/2026                     │
│ ─────────────────────────────────────────── │
│ Total: Bs 180.00 (2 × Bs 90.00)            │
└─────────────────────────────────────────────┘
```

---

## 🔄 Estado Actual

### ✅ Completado

1. ✅ Tipos TypeScript completos
2. ✅ Servicio de API con todos los endpoints
3. ✅ Funciones helper/utilidades
4. ✅ Componente de creación de membresía grupal
5. ✅ Validaciones de formulario
6. ✅ UI responsiva y accesible

### ⏳ Pendiente

1. ⏳ Actualizar lista de membresías (mostrar múltiples miembros)
2. ⏳ Actualizar vista de detalle (card con todos los miembros)
3. ⏳ Crear componente de renovación grupal
4. ⏳ Agregar ruta en el router para `/create-group`
5. ⏳ Agregar botón "Nueva Membresía Grupal" en listado
6. ⏳ Actualizar el formulario de crear individual para usar los nuevos tipos

---

## 📝 Ejemplo de Uso

### Crear Membresía Grupal de 2 Personas

```typescript
// 1. Usuario selecciona disciplina: Musculación
selectedDisciplineId = 'disc-musc-id';

// 2. Usuario selecciona plan: 2 personas, 1 mes, 90 BS c/u
selectedPlanId = 'plan-2p-1m-id';

// 3. Usuario selecciona miembros:
selectedMembers = [
  { id: 'juan-id', name: 'Juan Pérez', isPrimary: true },
  { id: 'maria-id', name: 'María López', isPrimary: false }
];

// 4. Submit genera payload:
{
  disciplineId: 'disc-musc-id',
  pricingPlanId: 'plan-2p-1m-id',
  members: [
    { memberId: 'juan-id', isPrimary: true },
    { memberId: 'maria-id', isPrimary: false }
  ],
  paymentMethod: 'efectivo',
  notes: 'Membresía familiar'
}

// 5. API response:
{
  id: 'memb-123',
  discipline: { name: 'Musculación' },
  pricingPlan: { num_people: 2, num_months: 1, price: 90 },
  total_amount: 180,
  membershipMembers: [
    {
      member: { name: 'Juan Pérez', code: 'MEM-0001' },
      price_applied: 90,
      is_primary: true
    },
    {
      member: { name: 'María López', code: 'MEM-0002' },
      price_applied: 90,
      is_primary: false
    }
  ]
}
```

---

## 🚀 Próximos Pasos para Completar Frontend

### 1. Actualizar Lista de Membresías

**Archivo:** `frontend/src/pages/admin-gym/memberships/list.tsx`

**Cambios necesarios:**
- Mostrar cantidad de miembros: "👥 2 miembros: Juan, María"
- Usar `membershipMembers` en lugar de `member`
- Soporte para búsqueda por cualquier miembro
- Badge especial para membresías grupales

### 2. Actualizar Vista de Detalle

**Archivo:** Crear `frontend/src/pages/admin-gym/memberships/show.tsx`

**Características:**
- Card con todos los miembros
- Indicador de titular
- Precio individual aplicado
- Opción de renovar (individual o grupal)
- Historial de asistencias por miembro

### 3. Crear Componente de Renovación Grupal

**Archivo:** `frontend/src/pages/admin-gym/memberships/renew-group.tsx`

**Flujo:**
- Mostrar miembros actuales con checkboxes
- Opción de agregar/quitar miembros
- Seleccionar nuevo plan
- Resumen con comparativa antes/después

### 4. Actualizar Rutas

**Archivo:** `frontend/src/App.tsx` o router

```tsx
<Route path="/admin-gym/memberships/create-group" element={<MembershipsCreateGroup />} />
<Route path="/admin-gym/memberships/:id/renew-group" element={<MembershipsRenewGroup />} />
<Route path="/admin-gym/memberships/:id" element={<MembershipsShow />} />
```

### 5. Agregar Botones en UI

En `list.tsx`:
```tsx
<Button onClick={() => push('/admin-gym/memberships/create')}>
  Nueva Membresía Individual
</Button>
<Button onClick={() => push('/admin-gym/memberships/create-group')}>
  Nueva Membresía Grupal
</Button>
```

---

## 📚 Referencias

- **Backend API:** `/backend/BACKEND-CHANGES.md`
- **Documentación diseño:** `/mejora-flujo.md`
- **Tipos TypeScript:** `/frontend/src/types/membership.ts`
- **Servicio API:** `/frontend/src/services/membershipService.ts`

---

**Fecha:** 29 de Enero, 2026
**Versión:** 1.0 (Parcial)
**Estado:** Frontend en progreso (60% completado) ⏳
