import { useState } from 'react';
import { Plus, Trash2, Image, X } from 'lucide-react';
import { cardApi } from '../../api/card';
import type { GalleryItem } from '../../api/card';
import toast from 'react-hot-toast';

interface GalleryEditorProps {
  value: GalleryItem[];
  onChange: (gallery: GalleryItem[]) => void;
}

export default function GalleryEditor({ value, onChange }: GalleryEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [editCaption, setEditCaption] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await cardApi.uploadGalleryImage(file);
      const newItem: GalleryItem = {
        id: crypto.randomUUID(),
        url: res.data.data.url,
        caption: '',
      };
      onChange([...value, newItem]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(value.map((item) => (item.id === id ? { ...item, caption } : item)));
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${apiUrl}${url}`;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">Gallery</label>

      <div className="grid grid-cols-3 gap-2">
        {value.map((item) => (
          <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-800">
            <img
              src={getImageUrl(item.url)}
              alt={item.caption || 'Gallery image'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setEditCaption(editCaption === item.id ? null : item.id)}
                className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <Image className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {editCaption === item.id && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80">
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={(e) => updateCaption(item.id, e.target.value)}
                    placeholder="Caption..."
                    maxLength={200}
                    className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setEditCaption(null)}
                    className="p-1 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {value.length < 20 && (
          <label className="aspect-square rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-zinc-500" />
                <span className="text-xs text-zinc-500">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-zinc-500">Upload images to showcase your work or business</p>
      )}
    </div>
  );
}
