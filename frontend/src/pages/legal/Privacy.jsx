import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: October 31, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At Hypz, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our cloud storage service. Please read this policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Personal Information
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Name and email address</li>
                  <li>Password (encrypted)</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Usage Information
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We automatically collect:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Storage usage and bandwidth consumption</li>
                  <li>API call logs and timestamps</li>
                  <li>Device information and IP addresses</li>
                  <li>Browser type and operating system</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  File Metadata
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We collect metadata about your files including filenames, sizes, upload dates, and access patterns. 
                  We do NOT access the content of your files.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-primary-600" />
              How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send billing information</li>
              <li>Send you technical notices, updates, and security alerts</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-600" />
              Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We implement industry-standard security measures to protect your data:
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Access Control:</strong> Strict role-based access controls and authentication
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Monitoring:</strong> 24/7 security monitoring and threat detection
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Backups:</strong> Regular automated backups with disaster recovery plans
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary-600" />
              Data Sharing and Disclosure
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information only in these circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (e.g., payment processors, hosting providers)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary-600" />
              Your Privacy Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Restrict or object to certain data processing</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@hypz.com" className="text-primary-600 hover:text-primary-700 font-medium underline">
                privacy@hypz.com
              </a>
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. 
              When you delete your account, we will delete your data within 30 days, except where retention is 
              required by law or for legitimate business purposes.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to improve user experience, analyze usage patterns, 
              and maintain security. You can control cookie preferences through your browser settings.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our Service is not intended for users under 18 years of age. We do not knowingly collect personal 
              information from children. If you are a parent or guardian and believe your child has provided us 
              with personal information, please contact us.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              International Data Transfers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last updated" date. We encourage you to review 
              this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@hypz.com" className="text-primary-600 hover:text-primary-700 underline">
                  privacy@hypz.com
                </a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                <strong>Address:</strong> Hypz Inc., Privacy Department
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center space-x-4">
          <Link 
            to="/terms" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Terms of Service
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
