import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MembersChartProps {
  data: Array<{
    month: string;
    newMembers: number;
    totalActive: number;
  }>;
}

export const MembersChart = ({ data }: MembersChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.month}</p>
          <p className="text-green-600">
            Nuevos: {payload[0].payload.newMembers}
          </p>
          <p className="text-blue-600">
            Total Activos: {payload[0].payload.totalActive}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="newMembers"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorNew)"
          name="Nuevos Members"
        />
        <Area
          type="monotone"
          dataKey="totalActive"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorTotal)"
          name="Total Activos"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
