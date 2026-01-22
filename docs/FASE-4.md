# Fase 4: Clases y Ventas

**Duración estimada:** 2-3 semanas  
**Estado:** ⏳ Pendiente  
**Requisito:** Completar Fase 3

---

## 4.1 Backend - Classes & Bookings

### Prisma Models (agregar)
- [ ] Modelo `GroupClass`
- [ ] Modelo `ClassBooking`
- [ ] Modelo `Product`
- [ ] Modelo `Sale`
- [ ] Modelo `SaleItem`
- [ ] Ejecutar migración

### Classes Routes `/api/classes`
- [ ] `GET /` - Listar clases del gym
- [ ] `POST /` - Crear clase
- [ ] `GET /:id` - Detalle de clase
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Eliminar
- [ ] `GET /schedule` - Horario semanal
- [ ] `GET /:id/availability` - Verificar cupos disponibles

### Bookings Routes `/api/bookings`
- [ ] `GET /` - Mis reservas (member)
- [ ] `POST /` - Reservar clase
- [ ] `DELETE /:id` - Cancelar reserva
- [ ] `GET /class/:classId` - Reservas de una clase (admin)
- [ ] `POST /:id/check-in` - Marcar asistencia a clase

---

## 4.2 Backend - Products & Sales

### Products Routes `/api/products`
- [ ] `GET /` - Listar productos
- [ ] `POST /` - Crear producto
- [ ] `PATCH /:id` - Actualizar
- [ ] `DELETE /:id` - Desactivar
- [ ] `PATCH /:id/stock` - Actualizar stock

### Sales Routes `/api/sales`
- [ ] `GET /` - Listar ventas
- [ ] `POST /` - Registrar venta
- [ ] `GET /:id` - Detalle de venta
- [ ] `GET /stats` - Estadísticas de ventas

---

## 4.3 Frontend - Admin - Clases Grupales

### Páginas
- [ ] `Classes/List` - Lista de clases
- [ ] `Classes/Create` - Crear clase
- [ ] `Classes/Edit` - Editar clase
- [ ] `Classes/Schedule` - Vista de horario semanal
- [ ] `Classes/Bookings` - Ver reservas por clase

### Componentes
- [ ] `ClassForm` - Formulario de clase
- [ ] `ClassCard` - Card de clase
- [ ] `WeeklySchedule` - Horario visual semanal
- [ ] `BookingsList` - Lista de reservas
- [ ] `CapacityIndicator` - Indicador de cupos

### Funcionalidades
- [ ] CRUD clases grupales
- [ ] Configurar día, hora, instructor, capacidad
- [ ] Vista de horario semanal visual
- [ ] Ver quién reservó cada clase
- [ ] Marcar asistencia a la clase

---

## 4.4 Frontend - App Cliente - Reservas

### Páginas
- [ ] `BookClasses` - Ver y reservar clases
- [ ] `MyBookings` - Mis reservas

### Componentes
- [ ] `ClassSchedule` - Horario de clases disponibles
- [ ] `ClassSlot` - Slot de clase con info
- [ ] `BookingCard` - Card de reserva
- [ ] `BookingConfirmation` - Confirmación de reserva

### Funcionalidades
- [ ] Ver clases disponibles por día
- [ ] Ver cupos disponibles
- [ ] Reservar clase (si hay cupo y membresía activa)
- [ ] Ver mis reservas
- [ ] Cancelar reserva (antes de la hora)

---

## 4.5 Frontend - Admin - Punto de Venta

### Páginas
- [ ] `Products/List` - Lista de productos
- [ ] `Products/Create` - Crear producto
- [ ] `Products/Edit` - Editar producto
- [ ] `Sales/POS` - Punto de venta
- [ ] `Sales/History` - Historial de ventas

### Componentes
- [ ] `ProductForm` - Formulario de producto
- [ ] `ProductCard` - Card de producto
- [ ] `POSCart` - Carrito de venta
- [ ] `CartItem` - Item en el carrito
- [ ] `PaymentModal` - Modal de pago
- [ ] `SaleReceipt` - Recibo de venta
- [ ] `StockIndicator` - Indicador de stock

### Funcionalidades
- [ ] CRUD productos con imagen
- [ ] Control de inventario (stock)
- [ ] Agregar productos al carrito
- [ ] Quitar productos del carrito
- [ ] Calcular total
- [ ] Registrar venta
- [ ] Vincular venta a member (opcional)
- [ ] Actualizar stock automáticamente
- [ ] Ver historial de ventas
- [ ] Ventas se registran en caja automáticamente

---

## ✅ Criterios de Completado Fase 4

- [ ] Admin puede crear clases grupales
- [ ] Admin puede ver horario semanal
- [ ] Members pueden reservar clases
- [ ] Members pueden cancelar reservas
- [ ] Admin puede gestionar productos
- [ ] POS funciona y registra ventas
- [ ] Stock se actualiza automáticamente
- [ ] Ventas aparecen en control de caja

---

## 📝 Notas

- Considerar límite de reservas por member
- Notificar cuando quedan pocos cupos
- Alertar cuando producto con stock bajo
