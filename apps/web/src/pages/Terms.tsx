import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function Terms() {
  return (
    <>
      <Helmet><title>Terms of Service — Cardova</title></Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Cardova ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">2. Description of Service</h2>
            <p>Cardova provides a platform for creating and sharing digital business cards. The Service includes both free and paid features. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">3. User Accounts</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and password. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Impersonate other individuals or entities</li>
              <li>Distribute spam, malware, or phishing content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">5. Payments and Subscriptions</h2>
            <p>Pro features require payment. All payments are processed through Stripe. Prices are in USD. Monthly subscriptions renew automatically. You may cancel at any time. Lifetime plans provide permanent access to Pro features. Refunds are available within 14 days of purchase.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">6. Intellectual Property</h2>
            <p>You retain ownership of content you create on Cardova. By using the Service, you grant us a license to display your public card content. The Cardova brand, logo, and platform code remain our intellectual property.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">7. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time through Settings. Upon termination, your data will be permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-200 mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@cardova.app" className="text-brand-400 hover:text-brand-300">support@cardova.app</a>.</p>
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
