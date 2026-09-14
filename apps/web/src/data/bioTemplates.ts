export interface BioTemplate {
  id: string
  label: string
  emoji: string
  template: string
  placeholders: string[]
}

export const bioTemplates: BioTemplate[] = [
  {
    id: 'developer',
    label: 'Software Developer',
    emoji: '💻',
    template:
      "I'm a software developer at {{company}}, specializing in {{specialty}}. I build tools and systems that solve real problems and enjoy collaborating with teams who care about craft.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'designer',
    label: 'Designer',
    emoji: '🎨',
    template:
      "I'm a {{specialty}} designer at {{company}}. I create intuitive, beautiful experiences that put users first and drive real business outcomes.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'marketer',
    label: 'Marketer',
    emoji: '📈',
    template:
      "I lead {{specialty}} at {{company}}, where I turn data into growth strategies that actually move the needle. Always experimenting, always learning.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'founder',
    label: 'Founder / CEO',
    emoji: '🚀',
    template:
      "I'm the founder of {{company}}, where we're building {{specialty}}. Previously worked on problems at the intersection of technology and human needs.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    emoji: '✨',
    template:
      "I'm an independent {{specialty}} consultant helping companies {{goal}}. Open to new projects and collaborations.",
    placeholders: ['specialty', 'goal'],
  },
  {
    id: 'student',
    label: 'Student',
    emoji: '🎓',
    template:
      "I'm studying {{specialty}} at {{school}}. Interested in {{interest}} and looking for opportunities to learn and contribute to meaningful projects.",
    placeholders: ['specialty', 'school', 'interest'],
  },
  {
    id: 'sales',
    label: 'Sales',
    emoji: '🤝',
    template:
      "I help companies {{goal}} at {{company}}. I believe in consultative selling — understanding what you actually need before pitching a solution.",
    placeholders: ['company', 'goal'],
  },
  {
    id: 'pm',
    label: 'Product Manager',
    emoji: '📋',
    template:
      "I'm a Product Manager at {{company}}, focused on {{specialty}}. I bridge the gap between users, engineering, and business to ship products people love.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'data',
    label: 'Data Scientist',
    emoji: '📊',
    template:
      "I work on {{specialty}} at {{company}}, turning complex data into clear insights that drive decisions. Background in statistics and machine learning.",
    placeholders: ['company', 'specialty'],
  },
  {
    id: 'creator',
    label: 'Content Creator',
    emoji: '🎬',
    template:
      "I create content about {{specialty}} for {{audience}}. My goal is to educate and inspire through authentic storytelling and practical advice.",
    placeholders: ['specialty', 'audience'],
  },
]

export function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return result
}

export function getPlaceholderLabel(placeholder: string): string {
  const labels: Record<string, string> = {
    company: 'Company',
    specialty: 'Your Specialty',
    goal: 'What you help with',
    school: 'School / University',
    interest: 'Your Interest',
    audience: 'Your Audience',
  }
  return labels[placeholder] || placeholder.charAt(0).toUpperCase() + placeholder.slice(1)
}

export function getPlaceholderExample(placeholder: string): string {
  const examples: Record<string, string> = {
    company: 'e.g. Stripe',
    specialty: 'e.g. full-stack development',
    goal: 'e.g. scale their revenue',
    school: 'e.g. MIT',
    interest: 'e.g. AI and robotics',
    audience: 'e.g. aspiring developers',
  }
  return examples[placeholder] || ''
}
