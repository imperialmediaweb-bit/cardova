interface VCardData {
  displayName: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string | null;
  socialLinks?: {
    email?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
  };
}

function escapeVCF(str: string): string {
  return str.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n';
    return '\\' + match;
  });
}

export function buildVCard(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCF(data.displayName)}`,
  ];

  if (data.title) {
    lines.push(`TITLE:${escapeVCF(data.title)}`);
  }

  if (data.company) {
    lines.push(`ORG:${escapeVCF(data.company)}`);
  }

  if (data.location) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCF(data.location)};;;;`);
  }

  if (data.bio) {
    lines.push(`NOTE:${escapeVCF(data.bio)}`);
  }

  if (data.socialLinks?.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.socialLinks.email}`);
  }

  if (data.socialLinks?.phone) {
    lines.push(`TEL;TYPE=CELL:${data.socialLinks.phone}`);
  }

  if (data.socialLinks?.website) {
    lines.push(`URL:${data.socialLinks.website}`);
  }

  if (data.socialLinks?.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.socialLinks.linkedin}`);
  }

  if (data.socialLinks?.twitter) {
    lines.push(`X-SOCIALPROFILE;TYPE=twitter:${data.socialLinks.twitter}`);
  }

  if (data.socialLinks?.github) {
    lines.push(`X-SOCIALPROFILE;TYPE=github:${data.socialLinks.github}`);
  }

  if (data.avatarUrl) {
    lines.push(`PHOTO;VALUE=uri:${data.avatarUrl}`);
  }

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}
