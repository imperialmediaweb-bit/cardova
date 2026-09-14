import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function Privacy() {
  return (
    <>
      <Helmet><title>Privacy Policy — Cardova</title></Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> Name, email address, and password (hashed) when you create an account.</p>
            <p><strong>Card Content:</strong> Information you add to your digital card, including name, title, company, bio, social links, services, and uploaded images.</p>
            <p><strong>Usage Data:</strong> Page views, referrer information, and basic analytics for card views.</p>
            <p><strong>Payment Information:</strong> Processed securely by Stripe. We do not store credit card numbers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>To provide and maintain the Service</li>
              <li>To display your public digital card</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (verification, password reset, billing)</li>
              <li>To provide analytics about your card views</li>
              <li>To improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">3. AI-Generated Content</h2>
            <p>When you use AI features, your card information (title, company, keywords) is sent to third-party AI providers (OpenAI, Anthropic, Google) to generate content. This data is used solely for content generation and is not stored by these providers for training purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>AI Providers</strong> — for content generation (only when you use AI features)</li>
              <li><strong>Cloudinary</strong> — for image storage (if configured)</li>
              <li><strong>Email Service</strong> — for transactional emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including password hashing (bcrypt), JWT authentication, HTTPS encryption, and rate limiting. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active. When you delete your account, all associated data is permanently removed from our systems.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data (via vCard download)</li>
              <li>Object to data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication (JWT tokens stored in localStorage). We do not use tracking cookies or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">9. Children's Privacy</h2>
            <p>The Service is not intended for children under 16. We do not knowingly collect information from children under 16.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">11. Contact</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:privacy@cardova.app" className="text-brand-400 hover:text-brand-300">privacy@cardova.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
