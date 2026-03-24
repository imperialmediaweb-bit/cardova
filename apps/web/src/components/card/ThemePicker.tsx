import { Check } from 'lucide-react';

interface ThemePickerProps {
  value: 'minimal' | 'bold' | 'glass';
  onChange: (theme: 'minimal' | 'bold' | 'glass') => void;
}

const themes = [
  { id: 'minimal' as const, name: 'Minimal', description: 'Clean and elegant', bg: 'bg-white', text: 'text-zinc-900' },
  { id: 'bold' as const, name: 'Bold', description: 'Dark and striking', bg: 'bg-zinc-900', text: 'text-white' },
  { id: 'glass' as const, name: 'Glass', description: 'Modern frosted', bg: 'bg-gradient-to-br from-brand-500/20 to-purple-500/20', text: 'text-white' },
];

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">Theme</label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              value === theme.id
                ? 'border-brand-500 ring-2 ring-brand-500/20'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <div className={`w-full h-12 rounded-lg ${theme.bg} mb-2`} />
            <p className="text-sm font-medium text-zinc-200">{theme.name}</p>
            <p className="text-xs text-zinc-500">{theme.description}</p>
            {value === theme.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
