# 📊 Fase 2 - Sección Reportes - Plan de Implementación

**Fecha inicio:** 2026-01-27
**Prioridad:** Alta
**Estimación:** 3-4 días

---

## 🎯 Objetivo

Implementar sistema completo de reportes para administradores del gym con:
- Reportes de ingresos (ventas de membresías)
- Reportes de asistencias
- Reportes de members (crecimiento, bajas, activos)
- Gráficas interactivas
- Exportación a Excel y PDF
- Filtros por fecha y disciplina

---

## 📋 Alcance de la Implementación

### Backend - API de Reportes

**Archivo nuevo:** `backend/src/services/reports.service.ts`
- Función: `getIncomeReport()` - Calcular ingresos por período
- Función: `getAttendanceReport()` - Estadísticas de asistencias
- Función: `getMembersReport()` - Crecimiento y estado de members
- Función: `exportToExcel()` - Generar archivo Excel
- Función: `exportToPDF()` - Generar archivo PDF

**Archivo nuevo:** `backend/src/controllers/reports.controller.ts`
- `GET /api/reports/income` - Reporte de ingresos
- `GET /api/reports/attendance` - Reporte de asistencias
- `GET /api/reports/members` - Reporte de members
- `GET /api/reports/export` - Exportar (Excel/PDF)

**Archivo nuevo:** `backend/src/routes/reports.routes.ts`
- Rutas protegidas (solo admin y receptionist)
- Validación de query params

**Paquetes NPM necesarios:**
- `exceljs` - Generar archivos Excel
- `pdfkit` - Generar archivos PDF
- `date-fns` - Manejo de fechas

### Frontend - Páginas de Reportes

**Carpeta nueva:** `frontend/src/pages/admin-gym/reports/`

**Página 1:** `reports/income/index.tsx`
- Filtros: Rango de fechas, disciplina
- Gráfica de barras (ingresos por mes/día)
- Tabla con detalle de membresías vendidas
- Totales y promedios
- Botón exportar

**Página 2:** `reports/attendance/index.tsx`
- Filtros: Rango de fechas, member
- Gráfica de líneas (asistencias por día)
- Top 10 members más activos
- Promedio de asistencias
- Horas pico

**Página 3:** `reports/members/index.tsx`
- Filtros: Rango de fechas
- Gráfica de crecimiento (nuevos vs bajas)
- Distribución por disciplina
- Members activos vs inactivos
- Retención mensual

**Página principal:** `reports/index.tsx`
- Dashboard de reportes con 3 cards/enlaces
- Acceso rápido a cada tipo de reporte

**Componentes nuevos:**
- `components/reports/DateRangePicker.tsx` - Selector de fechas
- `components/reports/ReportFilters.tsx` - Filtros reutilizables
- `components/reports/IncomeChart.tsx` - Gráfica de ingresos
- `components/reports/AttendanceChart.tsx` - Gráfica de asistencias
- `components/reports/MembersChart.tsx` - Gráfica de crecimiento
- `components/reports/ExportButton.tsx` - Botón exportar

**Paquetes NPM necesarios:**
- `recharts` - Gráficas interactivas
- `date-fns` - Manejo de fechas
- `file-saver` - Descargar archivos

---

## 🏗️ Plan de Implementación (Paso a Paso)

### Paso 1: Backend - Service de Reportes (1 día)

**Archivo:** `backend/src/services/reports.service.ts`

#### 1.1 Reporte de Ingresos
```typescript
interface IncomeReportFilters {
  startDate: Date;
  endDate: Date;
  disciplineId?: string;
}

interface IncomeReportData {
  summary: {
    totalIncome: number;
    totalMemberships: number;
    averageTicket: number;
  };
  byDiscipline: Array<{
    discipline: string;
    income: number;
    count: number;
  }>;
  byMonth: Array<{
    month: string;
    income: number;
    count: number;
  }>;
  memberships: Array<{
    date: Date;
    member: string;
    discipline: string;
    amount: number;
    paymentMethod: string;
  }>;
}
```

#### 1.2 Reporte de Asistencias
```typescript
interface AttendanceReportFilters {
  startDate: Date;
  endDate: Date;
  memberId?: string;
}

interface AttendanceReportData {
  summary: {
    totalAttendances: number;
    uniqueMembers: number;
    averagePerDay: number;
  };
  byDay: Array<{
    date: string;
    count: number;
  }>;
  byHour: Array<{
    hour: number;
    count: number;
  }>;
  topMembers: Array<{
    member: string;
    code: string;
    count: number;
  }>;
}
```

#### 1.3 Reporte de Members
```typescript
interface MembersReportFilters {
  startDate: Date;
  endDate: Date;
}

interface MembersReportData {
  summary: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    newMembers: number;
  };
  byMonth: Array<{
    month: string;
    newMembers: number;
    canceledMembers: number;
    netGrowth: number;
  }>;
  byDiscipline: Array<{
    discipline: string;
    activeCount: number;
    percentage: number;
  }>;
}
```

### Paso 2: Backend - Controller y Routes (0.5 día)

**Archivo:** `backend/src/controllers/reports.controller.ts`

```typescript
export const getIncomeReport = async (req: Request, res: Response) => {
  const { startDate, endDate, disciplineId } = req.query;
  // Validar fechas
  // Llamar al service
  // Retornar datos
};

export const getAttendanceReport = async (req: Request, res: Response) => {
  // Similar
};

export const getMembersReport = async (req: Request, res: Response) => {
  // Similar
};

export const exportReport = async (req: Request, res: Response) => {
  const { type, format } = req.query; // type: income|attendance|members, format: excel|pdf
  // Generar archivo
  // Enviar como download
};
```

**Archivo:** `backend/src/routes/reports.routes.ts`

```typescript
router.get('/income', roleMiddleware(['admin', 'receptionist']), getIncomeReport);
router.get('/attendance', roleMiddleware(['admin', 'receptionist']), getAttendanceReport);
router.get('/members', roleMiddleware(['admin', 'receptionist']), getMembersReport);
router.get('/export', roleMiddleware(['admin']), exportReport);
```

### Paso 3: Backend - Exportación (0.5 día)

#### 3.1 Instalar paquetes
```bash
cd backend
npm install exceljs pdfkit
npm install -D @types/pdfkit
```

#### 3.2 Implementar exportación a Excel
```typescript
import ExcelJS from 'exceljs';

export const generateIncomeExcel = async (data: IncomeReportData) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Ingresos');

  // Headers
  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Member', key: 'member', width: 30 },
    { header: 'Disciplina', key: 'discipline', width: 20 },
    { header: 'Monto', key: 'amount', width: 15 },
  ];

  // Data
  data.memberships.forEach(m => {
    sheet.addRow({
      date: format(m.date, 'dd/MM/yyyy'),
      member: m.member,
      discipline: m.discipline,
      amount: `Bs ${m.amount.toFixed(2)}`,
    });
  });

  // Total row
  sheet.addRow({});
  sheet.addRow({
    member: 'TOTAL',
    amount: `Bs ${data.summary.totalIncome.toFixed(2)}`,
  });

  return workbook.xlsx.writeBuffer();
};
```

#### 3.3 Implementar exportación a PDF
```typescript
import PDFDocument from 'pdfkit';

export const generateIncomePDF = async (data: IncomeReportData) => {
  const doc = new PDFDocument();

  // Header
  doc.fontSize(20).text('Reporte de Ingresos', { align: 'center' });
  doc.moveDown();

  // Summary
  doc.fontSize(14).text(`Total Ingresos: Bs ${data.summary.totalIncome.toFixed(2)}`);
  doc.text(`Total Membresías: ${data.summary.totalMemberships}`);
  doc.moveDown();

  // Table
  data.memberships.forEach(m => {
    doc.fontSize(10).text(
      `${format(m.date, 'dd/MM/yyyy')} - ${m.member} - ${m.discipline} - Bs ${m.amount.toFixed(2)}`
    );
  });

  doc.end();
  return doc;
};
```

### Paso 4: Frontend - Componentes Base (1 día)

#### 4.1 DateRangePicker
```tsx
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

export const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {
  return (
    <div className="flex gap-4">
      <Input
        type="date"
        value={format(startDate, 'yyyy-MM-dd')}
        onChange={(e) => onChange(new Date(e.target.value), endDate)}
      />
      <span className="self-center">hasta</span>
      <Input
        type="date"
        value={format(endDate, 'yyyy-MM-dd')}
        onChange={(e) => onChange(startDate, new Date(e.target.value))}
      />
    </div>
  );
};
```

#### 4.2 IncomeChart (Recharts)
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const IncomeChart = ({ data }: { data: Array<{ month: string; income: number }> }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `Bs ${value}`} />
        <Bar dataKey="income" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

#### 4.3 ExportButton
```tsx
export const ExportButton = ({ type, format, filters }: ExportButtonProps) => {
  const handleExport = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const params = new URLSearchParams({
      type,
      format,
      ...filters,
    });

    const response = await axios.get(
      `${API_URL}/reports/export?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data]);
    saveAs(blob, `reporte-${type}-${format(new Date(), 'yyyy-MM-dd')}.${format}`);
  };

  return (
    <Button onClick={handleExport}>
      📥 Exportar {format.toUpperCase()}
    </Button>
  );
};
```

### Paso 5: Frontend - Páginas de Reportes (1 día)

#### 5.1 Income Report
```tsx
export const IncomeReport = () => {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const [disciplineId, setDisciplineId] = useState<string>('');
  const [data, setData] = useState<IncomeReportData | null>(null);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, disciplineId]);

  return (
    <AdminGymLayout>
      <h1>Reporte de Ingresos</h1>

      {/* Filtros */}
      <Card>
        <DateRangePicker />
        <DisciplineSelect />
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>Total Ingresos: Bs {data?.summary.totalIncome}</Card>
        <Card>Membresías Vendidas: {data?.summary.totalMemberships}</Card>
        <Card>Ticket Promedio: Bs {data?.summary.averageTicket}</Card>
      </div>

      {/* Chart */}
      <Card>
        <IncomeChart data={data?.byMonth} />
      </Card>

      {/* Table */}
      <Card>
        <table>...</table>
      </Card>

      {/* Export */}
      <ExportButton type="income" format="excel" />
      <ExportButton type="income" format="pdf" />
    </AdminGymLayout>
  );
};
```

#### 5.2 Attendance Report
Similar estructura con:
- Gráfica de líneas (asistencias por día)
- Top 10 members
- Horas pico

#### 5.3 Members Report
Similar estructura con:
- Gráfica de crecimiento
- Distribución por disciplina
- Retención

### Paso 6: Integración y Testing (0.5 día)

- Agregar rutas en `App.tsx`
- Agregar enlaces en `AdminGymLayout.tsx`
- Testing de exportación
- Testing de filtros
- Testing responsive

---

## 📦 Paquetes NPM a Instalar

### Backend
```bash
cd backend
npm install exceljs pdfkit date-fns
npm install -D @types/pdfkit
```

### Frontend
```bash
cd frontend
npm install recharts date-fns file-saver
npm install -D @types/file-saver
```

---

## 🎨 Diseño de UI

### Dashboard de Reportes (Página Principal)
```
┌─────────────────────────────────────────────┐
│  📊 Reportes                                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 💰       │  │ 📅       │  │ 👥       │ │
│  │ Ingresos │  │Asistencias│ │ Members  │ │
│  │          │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Reporte Individual
```
┌─────────────────────────────────────────────┐
│  ← Reportes / Ingresos                      │
├─────────────────────────────────────────────┤
│  📅 Filtros:                                │
│  [01/01/2026] hasta [31/01/2026]           │
│  Disciplina: [Todas ▼]                     │
├─────────────────────────────────────────────┤
│  💰 Bs 15,450  │  🎫 42  │  📊 Bs 368     │
│  Total         │  Ventas │  Promedio       │
├─────────────────────────────────────────────┤
│  📊 Gráfica                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Barra chart interactiva]           │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  📋 Detalle                                 │
│  ┌─────────────────────────────────────┐   │
│  │ [Tabla con membresías]              │   │
│  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  [📥 Excel] [📥 PDF]                       │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] `reports.service.ts` - Función getIncomeReport
- [ ] `reports.service.ts` - Función getAttendanceReport
- [ ] `reports.service.ts` - Función getMembersReport
- [ ] `reports.service.ts` - Función generateIncomeExcel
- [ ] `reports.service.ts` - Función generateIncomePDF
- [ ] `reports.controller.ts` - Endpoint GET /income
- [ ] `reports.controller.ts` - Endpoint GET /attendance
- [ ] `reports.controller.ts` - Endpoint GET /members
- [ ] `reports.controller.ts` - Endpoint GET /export
- [ ] `reports.routes.ts` - Rutas protegidas
- [ ] `index.ts` - Montar rutas /api/reports
- [ ] Testing de endpoints con Postman

### Frontend - Componentes
- [ ] `DateRangePicker.tsx` - Selector de fechas
- [ ] `ReportFilters.tsx` - Filtros reutilizables
- [ ] `IncomeChart.tsx` - Gráfica de barras
- [ ] `AttendanceChart.tsx` - Gráfica de líneas
- [ ] `MembersChart.tsx` - Gráfica de área
- [ ] `ExportButton.tsx` - Botón exportar

### Frontend - Páginas
- [ ] `reports/index.tsx` - Dashboard principal
- [ ] `reports/income/index.tsx` - Reporte ingresos
- [ ] `reports/attendance/index.tsx` - Reporte asistencias
- [ ] `reports/members/index.tsx` - Reporte members
- [ ] Agregar rutas en App.tsx
- [ ] Agregar enlace en AdminGymLayout

### Testing
- [ ] Filtros funcionan correctamente
- [ ] Gráficas son responsive
- [ ] Exportación a Excel funciona
- [ ] Exportación a PDF funciona
- [ ] Datos son precisos
- [ ] UI responsive mobile

---

## 📝 Notas Técnicas

### Consultas SQL Pesadas
Algunos reportes pueden ser pesados. Considerar:
- Agregar índices en `created_at`, `checked_at`
- Cachear resultados por 5-10 minutos
- Limitar rango de fechas (máximo 1 año)

### Formato de Fechas
Usar `date-fns` consistentemente:
```typescript
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

format(new Date(), 'dd/MM/yyyy', { locale: es });
```

### Gráficas Responsive
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* ... */}
  </BarChart>
</ResponsiveContainer>
```

---

## 🎯 Criterios de Éxito

✅ Admin puede ver reporte de ingresos con filtros
✅ Admin puede ver reporte de asistencias
✅ Admin puede ver reporte de members
✅ Gráficas son interactivas y responsive
✅ Exportación a Excel funciona
✅ Exportación a PDF funciona
✅ UI responsive en mobile
✅ Datos son precisos y en tiempo real

---

## 🚀 Siguiente Paso

Una vez completados los reportes, continuar con:
- **Control de Caja** (registrar gastos)
- **Progreso Físico** (fotos y mediciones)

¿Quieres que empecemos con la implementación del backend?
