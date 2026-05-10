import { Check, Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export type ThemeId = 'minimal' | 'bold' | 'glass' | 'neon' | 'sunset' | 'ocean';

interface ThemePickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

const themes: { id: ThemeId; name: string; description: string; bg: string; text: string; pro?: boolean }[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and elegant', bg: 'bg-white', text: 'text-zinc-900' },
  { id: 'bold', name: 'Bold', description: 'Dark and striking', bg: 'bg-zinc-900', text: 'text-white' },
  { id: 'glass', name: 'Glass', description: 'Modern frosted', bg: 'bg-gradient-to-br from-brand-500/20 to-purple-500/20', text: 'text-white' },
  { id: 'neon', name: 'Neon', description: 'Electric vibes', bg: 'bg-gradient-to-br from-green-400/30 to-cyan-400/30', text: 'text-white', pro: true },
  { id: 'sunset', name: 'Sunset', description: 'Warm gradient', bg: 'bg-gradient-to-br from-orange-400/30 to-rose-400/30', text: 'text-white', pro: true },
  { id: 'ocean', name: 'Ocean', description: 'Deep & calm', bg: 'bg-gradient-to-br from-blue-500/30 to-teal-400/30', text: 'text-white', pro: true },
];

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  const { user } = useAuthStore();

  const handleSelect = (theme: typeof themes[0]) => {
    if (theme.pro && !user?.isPro) {
      toast('This theme requires Pro', { icon: '👑' });
      return;
    }
    onChange(theme.id);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">Theme</label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelect(theme)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              value === theme.id
                ? 'border-brand-500 ring-2 ring-brand-500/20'
                : theme.pro && !user?.isPro
                  ? 'border-zinc-800 opacity-60 hover:opacity-80'
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
            {theme.pro && !user?.isPro && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-zinc-700 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-zinc-400" />
              </div>
            )}
            {theme.pro && (
              <span className="absolute top-2 left-2 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                PRO
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
