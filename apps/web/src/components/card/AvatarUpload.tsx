import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cardApi } from '../../api/card';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  avatarUrl: string | null;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ avatarUrl, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);
    try {
      const res = await cardApi.uploadAvatar(file);
      onUpload(res.data.data.avatarUrl);
      toast.success('Avatar uploaded');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const displayUrl = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `${apiUrl}${avatarUrl}`
    : null;

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={() => fileRef.current?.click()}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-6 h-6 text-zinc-500" />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-sm text-brand-400 hover:text-brand-300 font-medium"
        >
          {uploading ? 'Uploading...' : 'Upload photo'}
        </button>
        <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG. Max 5MB.</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
