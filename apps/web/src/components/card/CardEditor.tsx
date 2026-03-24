import { useState, useEffect } from 'react';
import { Save, Sparkles, QrCode, Download } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ThemePicker from './ThemePicker';
import SocialLinksEditor from './SocialLinksEditor';
import AvatarUpload from './AvatarUpload';
import AIBioModal from './AIBioModal';
import { CardData, cardApi } from '../../api/card';
import toast from 'react-hot-toast';

interface CardEditorProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

export default function CardEditor({ card, onChange }: CardEditorProps) {
  const [saving, setSaving] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [form, setForm] = useState(card);

  useEffect(() => {
    setForm(card);
  }, [card]);

  const updateField = <K extends keyof CardData>(key: K, value: CardData[K]) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onChange(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await cardApi.updateCard({
        username: form.username,
        displayName: form.displayName,
        title: form.title,
        company: form.company,
        location: form.location,
        bio: form.bio,
        theme: form.theme,
        isPublished: form.isPublished,
        socialLinks: form.socialLinks,
      });
      onChange(res.data.data);
      toast.success('Card saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const res = await cardApi.getQRCode();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.username}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download QR code');
    }
  };

  const handleDownloadVCF = async () => {
    try {
      const res = await cardApi.getVCF();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.username}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download vCard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <AvatarUpload
        avatarUrl={form.avatarUrl}
        onUpload={(url) => updateField('avatarUrl', url)}
      />

      {/* Basic Info */}
      <Input
        label="Username"
        value={form.username}
        onChange={(e) => updateField('username', e.target.value.toLowerCase())}
        helperText={`cardova.net/${form.username}`}
      />
      <Input
        label="Display Name"
        value={form.displayName}
        onChange={(e) => updateField('displayName', e.target.value)}
      />
      <Input
        label="Title"
        value={form.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder="e.g. Senior Product Designer"
      />
      <Input
        label="Company"
        value={form.company}
        onChange={(e) => updateField('company', e.target.value)}
        placeholder="e.g. Stripe"
      />
      <Input
        label="Location"
        value={form.location}
        onChange={(e) => updateField('location', e.target.value)}
        placeholder="e.g. San Francisco, CA"
      />

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-300">Bio</label>
          <button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            Generate with AI
          </button>
        </div>
        <textarea
          value={form.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Tell people about yourself..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
        />
        <p className="text-xs text-zinc-500 text-right">{form.bio?.length || 0}/500</p>
      </div>

      {/* Theme */}
      <ThemePicker
        value={form.theme}
        onChange={(theme) => updateField('theme', theme)}
      />

      {/* Social Links */}
      <SocialLinksEditor
        value={form.socialLinks || {}}
        onChange={(links) => updateField('socialLinks', links)}
      />

      {/* Published Toggle */}
      <div className="flex items-center justify-between py-3 px-4 bg-zinc-900 rounded-lg border border-zinc-700">
        <div>
          <p className="text-sm font-medium text-zinc-200">Published</p>
          <p className="text-xs text-zinc-500">Make your card visible to everyone</p>
        </div>
        <button
          type="button"
          onClick={() => updateField('isPublished', !form.isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isPublished ? 'bg-brand-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              form.isPublished ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} isLoading={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Card
        </Button>
        <Button variant="secondary" onClick={handleDownloadQR}>
          <QrCode className="w-4 h-4" />
        </Button>
        <Button variant="secondary" onClick={handleDownloadVCF}>
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Modal */}
      <AIBioModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerated={(bio) => updateField('bio', bio)}
        defaultTitle={form.title}
        defaultCompany={form.company}
      />
    </div>
  );
}
