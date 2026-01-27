import { format } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  className = '',
}: DateRangePickerProps) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    onChange(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    onChange(startDate, newEndDate);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 items-start sm:items-center ${className}`}>
      <div className="flex-1 w-full sm:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Inicio
        </label>
        <input
          type="date"
          value={format(startDate, 'yyyy-MM-dd')}
          onChange={handleStartDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="hidden sm:flex items-center text-gray-500 pt-6">
        hasta
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha Fin
        </label>
        <input
          type="date"
          value={format(endDate, 'yyyy-MM-dd')}
          onChange={handleEndDateChange}
          min={format(startDate, 'yyyy-MM-dd')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
};
