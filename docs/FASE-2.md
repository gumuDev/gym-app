# Fase 2: Progreso y Reportes

**Duración estimada:** 2-3 semanas  
**Estado:** ⏳ Pendiente  
**Requisito:** Completar Fase 1

---

## 2.1 Backend - Progress & Reports

### Body Progress Routes `/api/body-progress`
- [ ] `GET /` - Listar mis registros de progreso
- [ ] `POST /` - Agregar registro (peso, medidas, foto)
- [ ] `GET /chart` - Datos formateados para gráfica
- [ ] `DELETE /:id` - Eliminar registro

### Upload Service
- [ ] Configurar Cloudinary
- [ ] `POST /api/upload` - Subir imagen
- [ ] Retornar URL de la imagen
- [ ] Validar tipo y tamaño de archivo

### Reports Routes `/api/reports`
- [ ] `GET /income` - Reporte de ingresos (filtros: fecha, disciplina)
- [ ] `GET /attendance` - Reporte de asistencias
- [ ] `GET /members` - Reporte de members (activos, nuevos, bajas)
- [ ] `GET /export` - Exportar a Excel/PDF

### Cash Routes `/api/cash`
- [ ] `GET /` - Listar movimientos de caja
- [ ] `POST /` - Registrar ingreso/egreso
- [ ] `GET /balance` - Balance del día
- [ ] `GET /summary` - Resumen por período

---

## 2.2 Frontend - App Cliente - Progreso

### Páginas
- [ ] `MyProgress` - Vista principal de progreso
- [ ] `MyProgress/Add` - Formulario agregar medición

### Componentes
- [ ] `WeightChart` - Gráfica de peso (Recharts)
- [ ] `MeasurementsForm` - Formulario de medidas corporales
- [ ] `PhotoUpload` - Subir foto de progreso
- [ ] `PhotoComparison` - Comparar antes/después
- [ ] `ProgressStats` - Estadísticas de progreso

### Funcionalidades
- [ ] Registrar peso con fecha
- [ ] Registrar medidas (brazos, pecho, cintura, cadera, piernas)
- [ ] Registrar % de grasa corporal
- [ ] Subir fotos de progreso
- [ ] Ver gráfica de evolución
- [ ] Comparar fotos de diferentes fechas

---

## 2.3 Frontend - Admin - Reportes

### Páginas
- [ ] `Reports/Income` - Reporte de ingresos
- [ ] `Reports/Attendance` - Reporte de asistencias
- [ ] `Reports/Members` - Reporte de members

### Componentes
- [ ] `IncomeChart` - Gráfica de ingresos (barras)
- [ ] `AttendanceChart` - Gráfica de asistencias
- [ ] `DateRangePicker` - Selector de rango de fechas
- [ ] `ReportFilters` - Filtros de reportes
- [ ] `ExportButton` - Botón exportar Excel/PDF

### Funcionalidades
- [ ] Filtrar por rango de fechas
- [ ] Filtrar por disciplina
- [ ] Ver totales y promedios
- [ ] Gráficas interactivas
- [ ] Exportar a Excel
- [ ] Exportar a PDF

---

## 2.4 Frontend - Admin - Control de Caja

### Páginas
- [ ] `Cash/Dashboard` - Balance y resumen
- [ ] `Cash/Movements` - Lista de movimientos
- [ ] `Cash/Add` - Registrar movimiento

### Componentes
- [ ] `CashBalance` - Card con balance actual
- [ ] `MovementForm` - Formulario ingreso/egreso
- [ ] `MovementsList` - Lista de movimientos
- [ ] `CashSummary` - Resumen por categoría

### Funcionalidades
- [ ] Registrar ingreso manual
- [ ] Registrar egreso (luz, agua, alquiler, etc.)
- [ ] Ver balance del día
- [ ] Historial de movimientos con filtros
- [ ] Membresías se registran automáticamente como ingreso

---

## ✅ Criterios de Completado Fase 2

- [ ] Members pueden registrar su progreso físico
- [ ] Members pueden subir fotos de progreso
- [ ] Gráficas de evolución funcionan
- [ ] Admin puede ver reportes de ingresos
- [ ] Admin puede ver reportes de asistencias
- [ ] Exportar a Excel/PDF funciona
- [ ] Control de caja operativo

---

## 📝 Notas

- Las fotos deben comprimirse antes de subir
- Gráficas deben ser responsivas
- Considerar cachear reportes pesados
