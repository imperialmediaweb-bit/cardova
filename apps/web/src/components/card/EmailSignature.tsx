import { useState } from 'react';
import { Copy, Check, Mail } from 'lucide-react';
import Button from '../ui/Button';
import type { CardData } from '../../api/card';
import toast from 'react-hot-toast';

interface EmailSignatureProps {
  card: CardData;
}

export default function EmailSignature({ card }: EmailSignatureProps) {
  const [copied, setCopied] = useState(false);

  const generateHTML = () => {
    const cardUrl = `https://cardova.net/${card.username}`;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const avatarSrc = card.avatarUrl ? (card.avatarUrl.startsWith('http') ? card.avatarUrl : `${apiUrl}${card.avatarUrl}`) : '';

    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#333;">
  <tr>
    <td style="padding-right:16px;vertical-align:top;">
      ${avatarSrc ? `<img src="${avatarSrc}" width="80" height="80" style="border-radius:50%;object-fit:cover;" alt="${card.displayName}" />` : ''}
    </td>
    <td style="vertical-align:top;">
      <strong style="font-size:16px;color:#111;">${card.displayName}</strong><br/>
      ${card.title ? `<span style="color:#666;">${card.title}${card.company ? ` at ${card.company}` : ''}</span><br/>` : ''}
      ${card.socialLinks?.email ? `<a href="mailto:${card.socialLinks.email}" style="color:#6366f1;text-decoration:none;">${card.socialLinks.email}</a><br/>` : ''}
      ${card.socialLinks?.phone ? `<span style="color:#666;">${card.socialLinks.phone}</span><br/>` : ''}
      <a href="${cardUrl}" style="color:#6366f1;text-decoration:none;font-size:13px;">View my digital card →</a>
    </td>
  </tr>
</table>`;
  };

  const handleCopy = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    setCopied(true);
    toast.success('HTML signature copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl border border-zinc-200">
        <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
      </div>
      <Button onClick={handleCopy} variant="secondary" className="w-full">
        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? 'Copied!' : 'Copy HTML Signature'}
      </Button>
      <p className="text-xs text-zinc-500">Paste this HTML into your email client's signature settings (Gmail, Outlook, etc.)</p>
    </div>
  );
}
