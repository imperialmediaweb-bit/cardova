import { useState } from 'react';
import { Plus, Trash2, Sparkles, GripVertical, Briefcase, Code, Palette, Camera, Wrench, Heart, BookOpen, ShoppingBag } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { ServiceItem } from '../../api/card';

interface ServicesEditorProps {
  value: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
  onAIGenerate: () => void;
}

const serviceIcons: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  code: Code,
  palette: Palette,
  camera: Camera,
  wrench: Wrench,
  heart: Heart,
  'book-open': BookOpen,
  'shopping-bag': ShoppingBag,
};

const iconOptions = Object.keys(serviceIcons);

export default function ServicesEditor({ value, onChange, onAIGenerate }: ServicesEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addService = () => {
    const newService: ServiceItem = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      price: '',
      icon: 'briefcase',
    };
    onChange([...value, newService]);
    setExpanded(newService.id);
  };

  const updateService = (id: string, field: keyof ServiceItem, val: string) => {
    onChange(value.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeService = (id: string) => {
    onChange(value.filter((s) => s.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">Services</label>
        <button
          type="button"
          onClick={onAIGenerate}
          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
        >
          <Sparkles className="w-3 h-3" />
          Generate with AI
        </button>
      </div>

      {value.map((service) => {
        const IconComponent = serviceIcons[service.icon || 'briefcase'] || Briefcase;
        const isExpanded = expanded === service.id;

        return (
          <div
            key={service.id}
            className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900/50"
          >
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : service.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {service.name || 'New Service'}
                </p>
                {service.price && (
                  <p className="text-xs text-zinc-500">{service.price}</p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeService(service.id); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
                <div className="pt-3">
                  <Input
                    label="Service Name"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Description</label>
                  <textarea
                    value={service.description || ''}
                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                    placeholder="Brief description of this service..."
                    rows={2}
                    maxLength={300}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none text-sm"
                  />
                </div>
                <Input
                  label="Price"
                  value={service.price || ''}
                  onChange={(e) => updateService(service.id, 'price', e.target.value)}
                  placeholder="e.g. $99/hr or From $199"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => {
                      const Icon = serviceIcons[icon];
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => updateService(service.id, 'icon', icon)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            service.icon === icon
                              ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30'
                              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {value.length < 20 && (
        <button
          type="button"
          onClick={addService}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      )}
    </div>
  );
}
