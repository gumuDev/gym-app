# 🧪 Testing: Subir Imagen de QR para Registro de Asistencias

## 📋 Funcionalidad Implementada

Se agregó la capacidad de registrar asistencias subiendo una **imagen del código QR** del cliente, además del escaneo en vivo con cámara.

## 🎯 Características

### Modo Dual de Escaneo

1. **📷 Escanear con Cámara** (modo original)
   - Usa la cámara del dispositivo en tiempo real
   - Escaneo continuo hasta detectar código

2. **🖼️ Subir Imagen** (nueva funcionalidad)
   - Permite seleccionar una imagen desde el dispositivo
   - Procesa el QR desde fotos guardadas
   - Útil cuando la cámara no funciona o se tiene una captura del QR

## 🧪 Pasos para Probar

### 1. Acceder al Scanner

1. Abre el frontend: `http://localhost:5173`
2. Login como Admin: `admin@gimolimp.com` / `admin123`
3. Navega a **Asistencias** → **Escanear QR**

### 2. Probar Modo Cámara (Original)

1. Click en la pestaña **📷 Escanear con Cámara**
2. Click en **Activar Cámara**
3. Apunta a un código QR de un member
4. Verifica que detecte automáticamente

### 3. Probar Modo Subir Imagen (Nuevo)

1. Click en la pestaña **🖼️ Subir Imagen**
2. Click en **Seleccionar Imagen**
3. Selecciona una imagen que contenga un QR de member
4. El sistema procesará la imagen automáticamente

### 4. Validaciones

Después de escanear (por cualquier método), el sistema debe:

- ✅ Mostrar información del cliente (nombre, código, teléfono)
- ✅ Mostrar estado de membresía (activa/vencida)
- ✅ Mostrar días restantes de membresía
- ✅ Alerta si está por vencer (≤7 días)
- ✅ Permitir registrar asistencia si hay membresía activa
- ✅ Bloquear registro si no hay membresía activa

## 📸 Cómo Obtener una Imagen QR de Prueba

### Opción 1: Desde la App

1. Ve a **Members** → Ver detalle de un member
2. Descarga el QR usando el botón **"Descargar QR"**
3. Usa esa imagen para probar la subida

### Opción 2: Screenshot

1. Ve a **Members** → Ver detalle de un member
2. Toma un screenshot de la pantalla con el QR visible
3. Usa ese screenshot para probar

## 🔍 Casos de Prueba

### Caso 1: Imagen Clara con QR Válido
- **Resultado esperado**: Decodifica correctamente y muestra info del member

### Caso 2: Imagen Borrosa
- **Resultado esperado**: Muestra error: "No se pudo leer el código QR de la imagen..."

### Caso 3: Imagen sin QR
- **Resultado esperado**: Muestra error: "No se pudo leer el código QR de la imagen..."

### Caso 4: QR de Member con Membresía Activa
- **Resultado esperado**:
  - Muestra info del member
  - Muestra membresía activa (verde)
  - Muestra días restantes
  - Botón "Registrar Asistencia" habilitado

### Caso 5: QR de Member sin Membresía Activa
- **Resultado esperado**:
  - Muestra info del member
  - Muestra mensaje "Sin Membresía Activa" (rojo)
  - Botón "Ver Cliente" en lugar de "Registrar Asistencia"

### Caso 6: QR de Member con Membresía por Vencer (≤7 días)
- **Resultado esperado**:
  - Muestra info del member
  - Muestra membresía activa
  - Muestra alerta amarilla: "⚠️ Membresía por vencer. Recordar al cliente renovar."
  - Puede registrar asistencia normalmente

## 🛠️ Implementación Técnica

### Componente Modificado
- `frontend/src/pages/admin-gym/attendances/scanner.tsx`

### Cambios Principales

1. **Estado `scanMode`**: alterna entre 'camera' y 'upload'
2. **Función `handleFileUpload()`**: procesa imagen seleccionada
3. **Función `handleModeChange()`**: cambia entre modos
4. **UI con Tabs**: navegación visual entre modos
5. **Input file oculto**: selección de imagen con label estilizado

### Librería Utilizada
- **html5-qrcode**: Método `scanFile()` para decodificar QR desde imagen

## ✅ Checklist de Pruebas

- [ ] Las tabs cambian correctamente entre modos
- [ ] Modo cámara funciona como antes
- [ ] Modo subir imagen muestra el selector de archivos
- [ ] Procesa correctamente imágenes con QR válido
- [ ] Muestra error apropiado si la imagen no contiene QR
- [ ] Muestra error apropiado si la imagen es borrosa
- [ ] El estado de loading se muestra mientras procesa
- [ ] Después de procesar, muestra la misma info que el modo cámara
- [ ] Se puede alternar entre modos sin problemas
- [ ] El input file se resetea después de cada uso
- [ ] Responsive: funciona bien en mobile y desktop

## 🚀 Próximas Mejoras Posibles

1. **Drag & Drop**: arrastrar imagen en lugar de seleccionar
2. **Vista previa**: mostrar la imagen seleccionada antes de procesar
3. **Múltiples QRs**: procesar varias imágenes en batch
4. **Historial**: guardar últimos QRs escaneados
5. **PWA**: usar la cámara nativa del teléfono para tomar foto directa

---

**Fecha de implementación**: 2026-01-26
**Desarrollado por**: Claude Code
