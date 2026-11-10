import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { getDateRange } from '../../utils/formatters';

const presets = [
  { label: 'This Month', value: 'current_month' },
  { label: 'Last 30 Days', value: 'last_30' },
  { label: 'Last 3 Months', value: 'last_3_months' },
  { label: 'Year to Date', value: 'year_to_date' },
];

export default function DateRangeFilter({ filters, onUpdate }) {
  const [selectedPreset, setSelectedPreset] = useState('current_month');
  const [customMode, setCustomMode] = useState(false);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setCustomMode(false);
    const range = getDateRange(preset);
    onUpdate(range);
  };

  const handleCustomChange = (field) => (e) => {
    setCustomMode(true);
    setSelectedPreset('');
    onUpdate({ [field]: e.target.value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetChange(preset.value)}
            className={`btn btn-sm transition-all duration-150 ${
              selectedPreset === preset.value && !customMode
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="date"
            value={filters.startDate}
            onChange={handleCustomChange('startDate')}
            className="input pl-10 pr-3 py-2 text-sm w-36"
            aria-label="Start date"
          />
        </div>
        <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">to</span>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="date"
            value={filters.endDate}
            onChange={handleCustomChange('endDate')}
            className="input pl-10 pr-3 py-2 text-sm w-36"
            aria-label="End date"
          />
        </div>
      </div>
    </div>
  );
}
