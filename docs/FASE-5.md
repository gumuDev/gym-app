# Fase 5: Extras

**Duración estimada:** 2-3 semanas  
**Estado:** ⏳ Pendiente  
**Requisito:** Completar Fase 4

---

## 5.1 Backend - Achievements (Gamificación)

### Prisma Models (agregar)
- [ ] Modelo `Achievement`
- [ ] Modelo `MemberAchievement`
- [ ] Ejecutar migración
- [ ] Seed con achievements predefinidos

### Achievements Routes `/api/achievements`
- [ ] `GET /` - Listar todos los achievements
- [ ] `GET /member/:memberId` - Achievements del member
- [ ] `GET /my` - Mis achievements (member)

### Achievement Service
- [ ] Definir tipos de achievements:
  - Racha de asistencias (7, 30, 100 días)
  - Tiempo como member (1, 3, 6, 12 meses)
  - Entrenamientos completados (10, 50, 100)
  - Progreso registrado (primer registro, 10 registros)
- [ ] Función calcular y otorgar achievements
- [ ] Notificar al member cuando desbloquea

### Achievement Job
- [ ] Crear `achievements.job.ts`
- [ ] Cron diario para calcular
- [ ] Verificar condiciones por member
- [ ] Otorgar achievements nuevos

---

## 5.2 Backend - WhatsApp Integration

### WhatsApp Service
- [ ] Configurar cuenta Twilio
- [ ] Crear templates de mensajes
- [ ] `whatsapp.service.ts`
- [ ] Función enviar mensaje
- [ ] Registrar en `NotificationLog`
- [ ] Contar mensajes para facturación

### Admin Config
- [ ] Endpoint para activar/desactivar WhatsApp
- [ ] Mostrar costo por mensaje
- [ ] Estadísticas de mensajes enviados

### Mensajes WhatsApp
- [ ] Bienvenida
- [ ] Recordatorio vencimiento (7, 3, 0 días)
- [ ] Confirmación de reserva
- [ ] Felicitación por logro

---

## 5.3 Backend - Invoicing (Super Admin)

### Invoice Job
- [ ] Crear `invoices.job.ts`
- [ ] Cron primer día del mes
- [ ] Por cada gym activo:
  - Contar members con membresía activa
  - Calcular: members × $2 Bs
  - Contar mensajes WhatsApp del mes
  - Calcular: mensajes × $0.10 Bs
  - Crear registro `GymInvoice`

### Invoice Routes (agregar a Super Admin)
- [ ] `GET /invoices` - Listar facturas
- [ ] `GET /invoices/:id` - Detalle
- [ ] `PATCH /invoices/:id/paid` - Marcar pagado
- [ ] `GET /invoices/stats` - Estadísticas MRR

### Dashboard Super Admin (mejorar)
- [ ] Gráfica MRR histórico
- [ ] Gyms con pago pendiente
- [ ] Crecimiento de clientes
- [ ] Tendencias

---

## 5.4 Frontend - App Cliente - Achievements

### Páginas
- [ ] `MyAchievements` - Mis logros

### Componentes
- [ ] `AchievementCard` - Card de logro
- [ ] `AchievementBadge` - Badge del logro
- [ ] `AchievementProgress` - Progreso hacia logro
- [ ] `AchievementUnlocked` - Modal al desbloquear

### Funcionalidades
- [ ] Ver logros desbloqueados
- [ ] Ver logros por desbloquear
- [ ] Ver progreso hacia cada logro
- [ ] Animación al desbloquear nuevo logro

---

## 5.5 Frontend - Admin - WhatsApp

### Páginas
- [ ] `Settings/WhatsApp` - Configuración WhatsApp

### Componentes
- [ ] `WhatsAppToggle` - Activar/desactivar
- [ ] `WhatsAppStats` - Estadísticas de mensajes
- [ ] `CostEstimate` - Estimación de costo mensual

### Funcionalidades
- [ ] Activar/desactivar WhatsApp para el gym
- [ ] Ver mensajes enviados este mes
- [ ] Ver costo estimado
- [ ] Advertencia de costos

---

## 5.6 Frontend - Super Admin - Invoicing

### Páginas
- [ ] `Invoices/List` - Lista de facturas
- [ ] `Invoices/Detail` - Detalle de factura
- [ ] `Dashboard` (mejorar) - Agregar métricas MRR

### Componentes
- [ ] `InvoiceTable` - Tabla de facturas
- [ ] `InvoiceDetail` - Detalle con breakdown
- [ ] `PaymentStatus` - Estado de pago
- [ ] `MRRChart` - Gráfica de MRR
- [ ] `GrowthChart` - Gráfica de crecimiento

### Funcionalidades
- [ ] Ver todas las facturas
- [ ] Filtrar por período, gym, estado
- [ ] Marcar como pagado
- [ ] Ver desglose (base + WhatsApp)
- [ ] Gráfica de MRR mensual
- [ ] Gráfica de crecimiento de gyms/members

---

## ✅ Criterios de Completado Fase 5

- [ ] Sistema de achievements funciona
- [ ] Members ven sus logros
- [ ] Notificación al desbloquear logro
- [ ] WhatsApp integration funciona
- [ ] Admin puede activar WhatsApp
- [ ] Mensajes se cobran correctamente
- [ ] Facturas se generan automáticamente
- [ ] Super Admin ve MRR y tendencias

---

## 📝 Notas

- Achievements deben ser motivadores, no frustrantes
- WhatsApp requiere templates aprobados por Meta
- Considerar emails de factura a los gyms
- Dashboard Super Admin debe cargar rápido (cachear)

---

## 🎉 Proyecto Completo

Al terminar Fase 5, el sistema tiene:

| Módulo | Estado |
|--------|--------|
| Multi-tenant SaaS | ✅ |
| Super Admin | ✅ |
| Admin Gym completo | ✅ |
| App Cliente completa | ✅ |
| QR Asistencias | ✅ |
| Progreso físico | ✅ |
| Rutinas y entrenamientos | ✅ |
| Clases grupales | ✅ |
| Punto de venta | ✅ |
| Reportes y caja | ✅ |
| Notificaciones Telegram | ✅ |
| Notificaciones WhatsApp | ✅ |
| Gamificación | ✅ |
| Facturación automática | ✅ |
