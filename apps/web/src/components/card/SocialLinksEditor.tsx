import { Twitter, Linkedin, Github, Instagram, Globe, Mail, Phone } from 'lucide-react';
import Input from '../ui/Input';

interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  website?: string;
  email?: string;
  phone?: string;
}

interface SocialLinksEditorProps {
  value: SocialLinks;
  onChange: (links: SocialLinks) => void;
}

const socialFields = [
  { key: 'twitter' as const, label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github' as const, label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'instagram' as const, label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'website' as const, label: 'Website', icon: Globe, placeholder: 'https://example.com' },
  { key: 'email' as const, label: 'Email', icon: Mail, placeholder: 'name@example.com' },
  { key: 'phone' as const, label: 'Phone', icon: Phone, placeholder: '+1 234 567 8900' },
];

export default function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const handleChange = (key: keyof SocialLinks, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-300">Social Links</label>
      {socialFields.map((field) => (
        <div key={field.key} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
            <field.icon className="w-4 h-4" />
          </div>
          <Input
            value={value[field.key] || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
