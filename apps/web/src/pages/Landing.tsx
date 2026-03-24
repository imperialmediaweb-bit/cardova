import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles, QrCode, BarChart3, Palette, ChevronDown,
  ArrowRight, Check, Star
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CardPreview from '../components/card/CardPreview';
import Button from '../components/ui/Button';
import { stripeApi } from '../api/stripe';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const demoCard = {
  displayName: 'Sarah Chen',
  title: 'Product Designer',
  company: 'Stripe',
  location: 'San Francisco, CA',
  bio: "I design interfaces that make complex financial products feel simple. Currently leading the Stripe Dashboard redesign and building design systems that scale.",
  avatarUrl: null,
  theme: 'glass' as const,
  socialLinks: {
    twitter: 'https://twitter.com/sarahchen',
    linkedin: 'https://linkedin.com/in/sarahchen',
    github: 'https://github.com/sarahchen',
    website: 'https://sarahchen.design',
    email: 'sarah@example.com',
  },
  isPro: true,
  username: 'sarahchen',
};

const features = [
  {
    icon: Sparkles,
    title: 'AI Bio Generator',
    description: 'Enter your job title and a few keywords. Our AI writes a professional bio that sounds like you, not a robot.',
  },
  {
    icon: QrCode,
    title: 'QR Code Sharing',
    description: 'Generate a beautiful QR code for your card. Perfect for conferences, meetups, and business cards.',
  },
  {
    icon: BarChart3,
    title: 'View Analytics',
    description: 'Track who views your card, where they come from, and which days get the most traffic.',
  },
  {
    icon: Palette,
    title: 'Premium Themes',
    description: 'Choose from Minimal, Bold, and Glass themes. Each one is designed to make your card stand out.',
  },
];

const testimonials = [
  {
    name: 'Marcus Rivera',
    role: 'Founder, NovaTech',
    quote: "I replaced my paper business cards with Cardova at a YC demo day. Got more follow-ups than I've ever gotten — people actually saved my contact from the QR code.",
  },
  {
    name: 'Priya Sharma',
    role: 'Freelance Developer',
    quote: "The AI bio generator is wild. I typed in 'full stack dev, Rust, open source' and it wrote a bio better than anything I could come up with in an hour.",
  },
  {
    name: 'James Okonkwo',
    role: 'VP Sales, Meridian',
    quote: "Our entire sales team uses Cardova Pro. The analytics alone are worth it — I can see which prospects actually looked at my card after a meeting.",
  },
];

const faqs = [
  {
    question: 'Is Cardova really free?',
    answer: 'Yes. You get a fully functional digital card with a custom username, social links, QR code, and 3 AI bio generations — completely free, forever.',
  },
  {
    question: 'What do I get with Pro?',
    answer: 'Pro unlocks unlimited AI bio generations, detailed view analytics (who viewed your card, top referrers, daily charts), and removes the "Powered by Cardova" badge from your card.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Not yet, but it\'s on our roadmap. Currently all cards are hosted at cardova.net/username.',
  },
  {
    question: 'How does the AI bio generator work?',
    answer: 'You enter your job title, company, and a few keywords that describe you. Our AI (powered by GPT-4o) writes a 2-3 sentence professional bio. Free users get 3 generations; Pro users get unlimited.',
  },
  {
    question: 'Can I cancel Pro anytime?',
    answer: 'Monthly plans can be cancelled anytime from your Stripe billing portal. If you chose the lifetime plan ($19 one-time), there\'s nothing to cancel — you have Pro forever.',
  },
];

const pricingFeatures = {
  free: [
    '1 digital card',
    'Custom username',
    'All 3 themes',
    'Social links & contact button',
    'QR code',
    'vCard download',
    '3 AI bio generations',
  ],
  pro: [
    'Everything in Free',
    'Unlimited AI bio generations',
    'View analytics & charts',
    'Top referrer tracking',
    'No "Powered by Cardova" badge',
    'Priority support',
  ],
};

export default function Landing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'lifetime'>('lifetime');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleGetPro = async () => {
    if (!user) {
      navigate('/register');
      return;
    }
    try {
      const res = await stripeApi.createCheckout(billingCycle);
      window.location.href = res.data.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
    }
  };

  return (
    <>
      <Helmet>
        <title>Cardova — Your Digital Business Card</title>
        <meta name="description" content="Create a beautiful digital business card with AI bio generation. Share via link or QR code. Free forever." />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-zinc-100 leading-tight">
                Your digital card.{' '}
                <span className="bg-gradient-to-r from-brand-400 to-purple-400 text-transparent bg-clip-text">
                  Share it everywhere.
                </span>
              </h1>
              <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-lg">
                Create a premium digital business card in 60 seconds. AI-powered bio, beautiful themes,
                QR code sharing. No app needed — just a link.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3">
                  Get your free card
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/sarahchen" className="btn-secondary text-base px-8 py-3">
                  See an example
                </Link>
              </div>
              <p className="mt-4 text-sm text-zinc-500">Free forever. No credit card required.</p>
            </div>

            {/* Demo Card */}
            <div className="hidden lg:block">
              <div className="transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <CardPreview {...demoCard} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100">Everything you need</h2>
            <p className="mt-3 text-zinc-400 text-lg">A complete digital card platform, not just a link-in-bio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-t border-zinc-800" id="pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-100">Simple pricing</h2>
            <p className="mt-3 text-zinc-400 text-lg">Start free, upgrade when you need more.</p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('lifetime')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'lifetime' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Lifetime
                <span className="ml-2 text-xs text-green-400 font-medium">Save 68%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <h3 className="text-xl font-bold text-zinc-100">Free</h3>
              <p className="text-zinc-400 mt-1">Everything to get started</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-zinc-100">$0</span>
                <span className="text-zinc-500 ml-2">forever</span>
              </div>
              <Link to="/register" className="mt-6 w-full btn-secondary block text-center">
                Get started
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingFeatures.free.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="p-8 bg-zinc-900/50 border-2 border-brand-500 rounded-2xl relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Pro</h3>
              <p className="text-zinc-400 mt-1">For professionals who want more</p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-zinc-100">
                  ${billingCycle === 'monthly' ? '5' : '19'}
                </span>
                <span className="text-zinc-500 ml-2">
                  {billingCycle === 'monthly' ? '/month' : 'one-time'}
                </span>
              </div>
              <button onClick={handleGetPro} className="mt-6 w-full btn-primary">
                Get Pro
              </button>
              <ul className="mt-8 space-y-3">
                {pricingFeatures.pro.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100">Loved by professionals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-100">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-200">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">Ready to stand out?</h2>
          <p className="text-zinc-400 text-lg mb-8">Create your digital business card in 60 seconds. Free forever.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3.5">
            Get your free card
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-sm font-semibold text-zinc-400">Cardova</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
              <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
              <Link to="/register" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
              <Link to="/login" className="hover:text-zinc-300 transition-colors">Log In</Link>
            </div>
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Cardova. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
