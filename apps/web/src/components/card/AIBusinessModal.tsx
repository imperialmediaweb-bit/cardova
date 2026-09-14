import { useState, useEffect } from 'react';
import { Sparkles, Zap, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { aiApi, AIProvider } from '../../api/ai';
import type { ServiceItem, CustomLink, BusinessHour } from '../../api/card';
import toast from 'react-hot-toast';

interface AIBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: {
    bio?: string;
    services?: ServiceItem[];
    customLinks?: CustomLink[];
    businessHours?: BusinessHour[];
  }) => void;
  defaultCompany?: string;
  defaultLocation?: string;
}

const providerLabels: Record<AIProvider, { name: string; color: string }> = {
  openai: { name: 'GPT-4o', color: 'text-green-400 border-green-500 bg-green-500/10' },
  claude: { name: 'Claude', color: 'text-orange-400 border-orange-500 bg-orange-500/10' },
  gemini: { name: 'Gemini', color: 'text-blue-400 border-blue-500 bg-blue-500/10' },
};

type GenerateMode = 'all' | 'services';

export default function AIBusinessModal({
  isOpen,
  onClose,
  onGenerated,
  defaultCompany = '',
  defaultLocation = '',
}: AIBusinessModalProps) {
  const [mode, setMode] = useState<GenerateMode>('all');
  const [businessName, setBusinessName] = useState(defaultCompany);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>(['openai']);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setBusinessName(defaultCompany);
      setLocation(defaultLocation);
      aiApi.getProviders().then((res) => {
        setAvailableProviders(res.data.data.providers);
      }).catch(() => {});
    }
  }, [isOpen, defaultCompany, defaultLocation]);

  const handleGenerate = async () => {
    if (!businessName.trim() || !industry.trim()) {
      toast.error('Business name and industry are required');
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      if (mode === 'all') {
        const res = await aiApi.generateBusinessContent({
          businessName,
          industry,
          location,
          provider,
        });
        const content = res.data.data.content;

        // Transform to proper format with IDs
        const services: ServiceItem[] = (content.services || []).map((s: any) => ({
          id: crypto.randomUUID(),
          name: s.name,
          description: s.description,
          price: s.price,
          icon: 'briefcase',
        }));

        const customLinks: CustomLink[] = (content.customLinks || []).map((l: any) => ({
          id: crypto.randomUUID(),
          title: l.title,
          url: l.url,
          icon: l.icon || 'link',
        }));

        const businessHours: BusinessHour[] = content.businessHours || [];

        setPreview({ bio: content.bio, services, customLinks, businessHours });
      } else {
        const res = await aiApi.generateServices({
          businessName,
          industry,
          description,
          provider,
        });

        const services: ServiceItem[] = res.data.data.services.map((s) => ({
          id: crypto.randomUUID(),
          name: s.name,
          description: s.description,
          price: s.price,
          icon: 'briefcase',
        }));

        setPreview({ services });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!preview) return;
    onGenerated(preview);
    handleClose();
    toast.success('Business content applied!');
  };

  const handleClose = () => {
    setPreview(null);
    setIndustry('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Business Assistant">
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
          <button
            onClick={() => { setMode('all'); setPreview(null); }}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'all' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Full Business Setup
          </button>
          <button
            onClick={() => { setMode('services'); setPreview(null); }}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'services' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Services Only
          </button>
        </div>

        {/* Provider Selector */}
        {availableProviders.length > 1 && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">AI Model</label>
            <div className="flex gap-2">
              {availableProviders.map((p) => {
                const info = providerLabels[p];
                return (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                      provider === p
                        ? info.color + ' ring-1 ring-current/20'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Input
          label="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Luminous Digital Agency"
        />
        <Input
          label="Industry / Category"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g. Digital Marketing, Restaurant, Photography"
        />
        {mode === 'all' && (
          <Input
            label="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bucharest, Romania"
          />
        )}
        {mode === 'services' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what your business does..."
              rows={2}
              maxLength={500}
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none text-sm"
            />
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="space-y-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle className="w-4 h-4" />
              Generated successfully!
            </div>

            {preview.bio && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bio</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{preview.bio}</p>
              </div>
            )}

            {preview.services?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Services ({preview.services.length})
                </p>
                <div className="space-y-1">
                  {preview.services.map((s: ServiceItem) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{s.name}</span>
                      {s.price && <span className="text-zinc-500">{s.price}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.businessHours?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Business Hours</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                  {preview.businessHours.map((h: any) => (
                    <div key={h.day} className="flex justify-between text-zinc-400">
                      <span>{h.day.slice(0, 3)}</span>
                      <span>{h.closed ? 'Closed' : `${h.open}-${h.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.customLinks?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Links ({preview.customLinks.length})
                </p>
                {preview.customLinks.map((l: any) => (
                  <p key={l.id} className="text-sm text-zinc-300">{l.title}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {preview ? (
            <>
              <Button onClick={handleApply} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply to Card
              </Button>
              <Button variant="secondary" onClick={handleGenerate} isLoading={loading}>
                Regenerate
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerate} isLoading={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating with {providerLabels[provider].name}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with {providerLabels[provider].name}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
