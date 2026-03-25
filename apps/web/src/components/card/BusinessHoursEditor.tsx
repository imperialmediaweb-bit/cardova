import type { BusinessHour } from '../../api/card';

interface BusinessHoursEditorProps {
  value: BusinessHour[];
  onChange: (hours: BusinessHour[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((day) => ({
  day,
  open: day === 'Saturday' || day === 'Sunday' ? '' : '09:00',
  close: day === 'Saturday' || day === 'Sunday' ? '' : '18:00',
  closed: day === 'Saturday' || day === 'Sunday',
}));

export default function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  // Initialize with defaults if empty
  const hours = value.length === 7 ? value : DEFAULT_HOURS;

  const handleInit = () => {
    onChange(DEFAULT_HOURS);
  };

  const updateHour = (index: number, field: keyof BusinessHour, val: string | boolean) => {
    const updated = hours.map((h, i) => (i === index ? { ...h, [field]: val } : h));
    onChange(updated);
  };

  if (value.length === 0) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">Business Hours</label>
        <button
          type="button"
          onClick={handleInit}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 border border-dashed border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
        >
          Set Business Hours
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">Business Hours</label>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-zinc-500 hover:text-zinc-400"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {hours.map((hour, index) => (
          <div
            key={hour.day}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
              hour.closed
                ? 'border-zinc-800 bg-zinc-900/30'
                : 'border-zinc-700 bg-zinc-900/50'
            }`}
          >
            <span className="text-sm text-zinc-300 w-20 flex-shrink-0 font-medium">
              {hour.day.slice(0, 3)}
            </span>

            {hour.closed ? (
              <span className="text-sm text-zinc-500 flex-1">Closed</span>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={hour.open}
                  onChange={(e) => updateHour(index, 'open', e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-zinc-500 text-xs">to</span>
                <input
                  type="time"
                  value={hour.close}
                  onChange={(e) => updateHour(index, 'close', e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => updateHour(index, 'closed', !hour.closed)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                !hour.closed ? 'bg-brand-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                  !hour.closed ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
