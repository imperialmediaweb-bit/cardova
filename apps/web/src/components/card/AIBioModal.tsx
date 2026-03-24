import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { aiApi } from '../../api/ai';
import toast from 'react-hot-toast';

interface AIBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (bio: string) => void;
  defaultTitle?: string;
  defaultCompany?: string;
}

export default function AIBioModal({
  isOpen,
  onClose,
  onGenerated,
  defaultTitle = '',
  defaultCompany = '',
}: AIBioModalProps) {
  const [jobTitle, setJobTitle] = useState(defaultTitle);
  const [company, setCompany] = useState(defaultCompany);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [generatedBio, setGeneratedBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const keywords = keywordsInput.split(',').map((k) => k.trim()).filter(Boolean);
    if (!jobTitle || !company || keywords.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await aiApi.generateBio({ jobTitle, company, keywords });
      setGeneratedBio(res.data.data.bio);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate bio');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = () => {
    onGenerated(generatedBio);
    setGeneratedBio('');
    onClose();
  };

  const handleClose = () => {
    setGeneratedBio('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Bio with AI">
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

        {generatedBio && (
          <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
            <p className="text-sm text-zinc-300 leading-relaxed">{generatedBio}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {generatedBio ? (
            <>
              <Button onClick={handleUse} className="flex-1">
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
    </Modal>
  );
}
