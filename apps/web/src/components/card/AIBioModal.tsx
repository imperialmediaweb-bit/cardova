import { useState } from 'react';
import { Sparkles, FileText, Wand2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { aiApi } from '../../api/ai';
import { bioTemplates, fillTemplate, getPlaceholderLabel, getPlaceholderExample } from '../../data/bioTemplates';
import toast from 'react-hot-toast';

interface AIBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (bio: string) => void;
  defaultTitle?: string;
  defaultCompany?: string;
}

type Tab = 'templates' | 'ai';
type Tone = 'professional' | 'friendly' | 'creative';

export default function AIBioModal({
  isOpen,
  onClose,
  onGenerated,
  defaultTitle = '',
  defaultCompany = '',
}: AIBioModalProps) {
  const [tab, setTab] = useState<Tab>('templates');

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [previewBio, setPreviewBio] = useState('');

  // AI state
  const [jobTitle, setJobTitle] = useState(defaultTitle);
  const [company, setCompany] = useState(defaultCompany);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [generatedBio, setGeneratedBio] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedTemplateData = bioTemplates.find((t) => t.id === selectedTemplate);

  const handleSelectTemplate = (id: string) => {
    const tmpl = bioTemplates.find((t) => t.id === id);
    if (!tmpl) return;
    setSelectedTemplate(id);
    // Pre-fill with card data where possible
    const initial: Record<string, string> = {};
    for (const p of tmpl.placeholders) {
      if (p === 'company' && defaultCompany) initial[p] = defaultCompany;
      else if (p === 'specialty' && defaultTitle) initial[p] = defaultTitle;
      else initial[p] = '';
    }
    setPlaceholderValues(initial);
    setPreviewBio(fillTemplate(tmpl.template, initial));
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    const updated = { ...placeholderValues, [key]: value };
    setPlaceholderValues(updated);
    if (selectedTemplateData) {
      setPreviewBio(fillTemplate(selectedTemplateData.template, updated));
    }
  };

  const handleUseTemplate = () => {
    // Check all placeholders are filled
    if (selectedTemplateData) {
      const empty = selectedTemplateData.placeholders.filter((p) => !placeholderValues[p]?.trim());
      if (empty.length > 0) {
        toast.error('Please fill in all fields');
        return;
      }
    }
    onGenerated(previewBio);
    handleClose();
  };

  const handleGenerate = async () => {
    const keywords = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);
    if (!jobTitle || !company || keywords.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await aiApi.generateBio({ jobTitle, company, keywords, tone });
      setGeneratedBio(res.data.data.bio);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate bio');
    } finally {
      setLoading(false);
    }
  };

  const handleUseAI = () => {
    onGenerated(generatedBio);
    handleClose();
  };

  const handleClose = () => {
    setGeneratedBio('');
    setSelectedTemplate(null);
    setPlaceholderValues({});
    setPreviewBio('');
    onClose();
  };

  const tones: { value: Tone; label: string; desc: string }[] = [
    { value: 'professional', label: 'Professional', desc: 'Polished & formal' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm & approachable' },
    { value: 'creative', label: 'Creative', desc: 'Bold & unique' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Your Bio">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
          <button
            onClick={() => setTab('templates')}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'templates' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Templates
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'ai' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </button>
        </div>

        {/* Templates Tab */}
        {tab === 'templates' && (
          <div className="space-y-4">
            {!selectedTemplate ? (
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {bioTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="text-left p-3 rounded-xl border border-zinc-700 hover:border-brand-500 hover:bg-zinc-800/50 transition-all group"
                  >
                    <span className="text-lg">{tmpl.emoji}</span>
                    <p className="text-sm font-medium text-zinc-200 mt-1">{tmpl.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tmpl.template.substring(0, 60)}...</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setPlaceholderValues({});
                    setPreviewBio('');
                  }}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  &larr; Back to templates
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedTemplateData?.emoji}</span>
                  <p className="text-sm font-semibold text-zinc-200">{selectedTemplateData?.label}</p>
                </div>

                {selectedTemplateData?.placeholders.map((p) => (
                  <Input
                    key={p}
                    label={getPlaceholderLabel(p)}
                    value={placeholderValues[p] || ''}
                    onChange={(e) => handlePlaceholderChange(p, e.target.value)}
                    placeholder={getPlaceholderExample(p)}
                  />
                ))}

                {previewBio && (
                  <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1">Preview</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{previewBio}</p>
                  </div>
                )}

                <Button onClick={handleUseTemplate} className="w-full">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use This Bio
                </Button>
              </div>
            )}
          </div>
        )}

        {/* AI Generate Tab */}
        {tab === 'ai' && (
          <div className="space-y-4">
            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Product Designer"
            />
            <Input
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
            />
            <Input
              label="Keywords (comma-separated)"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="e.g. design systems, accessibility, user research"
              helperText="Add 1-5 keywords that describe your expertise"
            />

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      tone === t.value
                        ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/20'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <p className={`text-xs font-medium ${tone === t.value ? 'text-brand-400' : 'text-zinc-300'}`}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {generatedBio && (
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <p className="text-sm text-zinc-300 leading-relaxed">{generatedBio}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {generatedBio ? (
                <>
                  <Button onClick={handleUseAI} className="flex-1">
                    Use this bio
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleGenerate}
                    isLoading={loading}
                  >
                    Regenerate
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGenerate}
                  isLoading={loading}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Bio
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
