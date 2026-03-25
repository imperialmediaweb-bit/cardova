import { useState, useEffect } from 'react';
import { Save, Sparkles, Wand2, Building2, User, Zap, ChevronDown, ChevronRight, Globe, Image, Clock, Link2, Palette, Users } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ThemePicker from './ThemePicker';
import SocialLinksEditor from './SocialLinksEditor';
import AvatarUpload from './AvatarUpload';
import AIBioModal from './AIBioModal';
import AIBusinessModal from './AIBusinessModal';
import ServicesEditor from './ServicesEditor';
import CustomLinksEditor from './CustomLinksEditor';
import BusinessHoursEditor from './BusinessHoursEditor';
import GalleryEditor from './GalleryEditor';
import { CardData, cardApi } from '../../api/card';
import { aiApi } from '../../api/ai';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface CardEditorProps {
  card: CardData;
  onChange: (card: CardData) => void;
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-200">{title}</p>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-800/50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function CardEditor({ card, onChange }: CardEditorProps) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [improving, setImproving] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAIBusinessModal, setShowAIBusinessModal] = useState(false);
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
        cardType: form.cardType,
        services: form.services,
        customLinks: form.customLinks,
        businessHours: form.businessHours,
        gallery: form.gallery,
      });
      onChange(res.data.data);
      toast.success('Card saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleImproveBio = async () => {
    if (!user?.isPro) {
      toast('Upgrade to Pro for AI bio improvement', { icon: '👑' });
      return;
    }
    if (!form.bio?.trim()) {
      toast.error('Write a bio first, then improve it with AI');
      return;
    }
    setImproving(true);
    try {
      const res = await aiApi.improveBio({ bio: form.bio });
      updateField('bio', res.data.data.bio);
      toast.success('Bio improved!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to improve bio');
    } finally {
      setImproving(false);
    }
  };

  const handleAIBusinessGenerated = (data: {
    bio?: string;
    services?: any[];
    customLinks?: any[];
    businessHours?: any[];
  }) => {
    const updated = { ...form };
    if (data.bio) updated.bio = data.bio;
    if (data.services) updated.services = data.services;
    if (data.customLinks) updated.customLinks = data.customLinks;
    if (data.businessHours) updated.businessHours = data.businessHours;
    setForm(updated);
    onChange(updated);
  };

  const isBusiness = form.cardType === 'business';

  return (
    <div className="space-y-4">
      {/* Card Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => updateField('cardType', 'personal')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
            !isBusiness
              ? 'border-brand-500 bg-brand-500/5'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            !isBusiness ? 'bg-brand-500/20 text-brand-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${!isBusiness ? 'text-brand-400' : 'text-zinc-400'}`}>Personal</p>
            <p className="text-[11px] text-zinc-500">Individual card</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => updateField('cardType', 'business')}
          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
            isBusiness
              ? 'border-brand-500 bg-brand-500/5'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isBusiness ? 'bg-brand-500/20 text-brand-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${isBusiness ? 'text-brand-400' : 'text-zinc-400'}`}>Business</p>
            <p className="text-[11px] text-zinc-500">Company card</p>
          </div>
        </button>
      </div>

      {/* AI Business Setup */}
      {isBusiness && (
        <button
          type="button"
          onClick={() => setShowAIBusinessModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-pink-500/10 border border-brand-500/20 rounded-xl text-sm font-medium text-brand-300 hover:from-brand-500/20 hover:via-purple-500/20 hover:to-pink-500/20 transition-all"
        >
          <Zap className="w-4 h-4" />
          AI Business Setup — Generate everything
        </button>
      )}

      {/* Profile Section */}
      <Section icon={User} title="Profile" subtitle="Avatar, name, and details" defaultOpen={true}>
        <AvatarUpload
          avatarUrl={form.avatarUrl}
          onUpload={(url) => updateField('avatarUrl', url)}
        />
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
          label={isBusiness ? 'Role / Position' : 'Title'}
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder={isBusiness ? 'e.g. Owner & CEO' : 'e.g. Senior Product Designer'}
        />
        <Input
          label={isBusiness ? 'Business Name' : 'Company'}
          value={form.company}
          onChange={(e) => updateField('company', e.target.value)}
          placeholder={isBusiness ? 'e.g. Luminous Digital Agency' : 'e.g. Stripe'}
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
            <label className="block text-sm font-medium text-zinc-300">
              {isBusiness ? 'About' : 'Bio'}
            </label>
            <div className="flex items-center gap-2">
              {form.bio?.trim() && (
                <button
                  type="button"
                  onClick={handleImproveBio}
                  disabled={improving}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50"
                >
                  <Wand2 className={`w-3 h-3 ${improving ? 'animate-spin' : ''}`} />
                  {improving ? 'Improving...' : 'Improve'}
                  {!user?.isPro && <span className="text-[10px] text-zinc-600">Pro</span>}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                Generate
              </button>
            </div>
          </div>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder={isBusiness ? 'Tell people about your business...' : 'Tell people about yourself...'}
            rows={3}
            maxLength={500}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none text-sm"
          />
          <p className="text-[11px] text-zinc-600 text-right">{form.bio?.length || 0}/500</p>
        </div>
      </Section>

      {/* Business Sections */}
      {isBusiness && (
        <>
          <Section icon={Users} title="Services" subtitle={`${(form.services || []).length} services`}>
            <ServicesEditor
              value={form.services || []}
              onChange={(services) => updateField('services', services)}
              onAIGenerate={() => setShowAIBusinessModal(true)}
            />
          </Section>

          <Section icon={Link2} title="Custom Links" subtitle={`${(form.customLinks || []).length} links`}>
            <CustomLinksEditor
              value={form.customLinks || []}
              onChange={(links) => updateField('customLinks', links)}
            />
          </Section>

          <Section icon={Clock} title="Business Hours" subtitle="Opening times" defaultOpen={false}>
            <BusinessHoursEditor
              value={form.businessHours || []}
              onChange={(hours) => updateField('businessHours', hours)}
            />
          </Section>

          <Section icon={Image} title="Gallery" subtitle={`${(form.gallery || []).length} images`} defaultOpen={false}>
            <GalleryEditor
              value={form.gallery || []}
              onChange={(gallery) => updateField('gallery', gallery)}
            />
          </Section>
        </>
      )}

      {/* Theme */}
      <Section icon={Palette} title="Theme" subtitle={form.theme} defaultOpen={false}>
        <ThemePicker
          value={form.theme}
          onChange={(theme) => updateField('theme', theme)}
        />
      </Section>

      {/* Social Links */}
      <Section icon={Globe} title="Social Links" subtitle="Connect your accounts" defaultOpen={false}>
        <SocialLinksEditor
          value={form.socialLinks || {}}
          onChange={(links) => updateField('socialLinks', links)}
        />
      </Section>

      {/* Published Toggle */}
      <div className="flex items-center justify-between py-3 px-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div>
          <p className="text-sm font-medium text-zinc-200">Published</p>
          <p className="text-[11px] text-zinc-500">Your card is {form.isPublished ? 'visible' : 'hidden'}</p>
        </div>
        <button
          type="button"
          onClick={() => updateField('isPublished', !form.isPublished)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            form.isPublished ? 'bg-green-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              form.isPublished ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Save Button - Sticky */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={handleSave} isLoading={saving} className="w-full shadow-xl shadow-brand-500/10">
          <Save className="w-4 h-4 mr-2" />
          Save Card
        </Button>
      </div>

      {/* AI Modals */}
      <AIBioModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerated={(bio) => updateField('bio', bio)}
        defaultTitle={form.title}
        defaultCompany={form.company}
      />

      <AIBusinessModal
        isOpen={showAIBusinessModal}
        onClose={() => setShowAIBusinessModal(false)}
        onGenerated={handleAIBusinessGenerated}
        defaultCompany={form.company}
        defaultLocation={form.location}
      />
    </div>
  );
}
