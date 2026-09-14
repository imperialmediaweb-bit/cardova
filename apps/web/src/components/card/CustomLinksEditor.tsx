import { useState } from 'react';
import { Plus, Trash2, GripVertical, Link, Calendar, ShoppingBag, Camera, FileText, Map, Star, Menu, ExternalLink } from 'lucide-react';
import Input from '../ui/Input';
import type { CustomLink } from '../../api/card';

interface CustomLinksEditorProps {
  value: CustomLink[];
  onChange: (links: CustomLink[]) => void;
}

const linkIcons: Record<string, React.ElementType> = {
  link: Link,
  calendar: Calendar,
  'shopping-bag': ShoppingBag,
  camera: Camera,
  'file-text': FileText,
  map: Map,
  star: Star,
  menu: Menu,
  'external-link': ExternalLink,
};

const iconOptions = Object.keys(linkIcons);

export default function CustomLinksEditor({ value, onChange }: CustomLinksEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addLink = () => {
    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      title: '',
      url: '',
      icon: 'link',
    };
    onChange([...value, newLink]);
    setExpanded(newLink.id);
  };

  const updateLink = (id: string, field: keyof CustomLink, val: string) => {
    onChange(value.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  };

  const removeLink = (id: string) => {
    onChange(value.filter((l) => l.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">Custom Links</label>

      {value.map((link) => {
        const IconComponent = linkIcons[link.icon || 'link'] || Link;
        const isExpanded = expanded === link.id;

        return (
          <div
            key={link.id}
            className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900/50"
          >
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : link.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {link.title || 'New Link'}
                </p>
                {link.url && (
                  <p className="text-xs text-zinc-500 truncate">{link.url}</p>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeLink(link.id); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
                <div className="pt-3">
                  <Input
                    label="Title"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                    placeholder="e.g. Book Appointment"
                  />
                </div>
                <Input
                  label="URL"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                  placeholder="https://..."
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((icon) => {
                      const Icon = linkIcons[icon];
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => updateLink(link.id, 'icon', icon)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            link.icon === icon
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
          onClick={addLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      )}
    </div>
  );
}
