import { Link } from 'react-router-dom';
import { FileText, Scale, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Scale className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: October 31, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Welcome to Hypz. These Terms of Service ("Terms") govern your access to and use of Hypz's cloud storage services, 
              including our website, APIs, and any related services (collectively, the "Service"). By accessing or using the Service, 
              you agree to be bound by these Terms.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Account Terms
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>You must be at least 18 years old to use this Service.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>You must provide accurate and complete information when creating an account.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>You are responsible for maintaining the security of your account and password.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p>You may not use the Service for any illegal or unauthorized purpose.</p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary-600" />
              3. Acceptable Use Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>Store or distribute malicious software, viruses, or harmful code</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>Engage in any activity that violates applicable laws or regulations</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>Infringe on intellectual property rights of others</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>Attempt to gain unauthorized access to the Service or related systems</p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>Abuse, harass, or harm another person or entity</p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Payment Terms
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p className="leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Free Plan:</strong> We offer a free tier with 
                limited storage, bandwidth, and API calls as specified in our pricing page.
              </p>
              <p className="leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Pay-as-you-go Plan:</strong> Usage beyond the 
                free tier will be charged according to our published rates. Charges are calculated monthly based 
                on actual usage.
              </p>
              <p className="leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Billing:</strong> You agree to pay all fees 
                associated with your use of the Service. All fees are non-refundable except as required by law.
              </p>
            </div>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Data and Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your use of the Service is also governed by our{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium underline">
                Privacy Policy
              </Link>
              . You retain all rights to your data. We will not access, view, or use your data except as necessary 
              to provide the Service or as required by law.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Service Availability
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We strive to provide 99.9% uptime but cannot guarantee uninterrupted service. We may perform 
              maintenance or updates that temporarily affect service availability. We are not liable for any 
              losses resulting from service interruptions.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Hypz and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Termination
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, if you breach these 
              Terms. Upon termination, your right to use the Service will immediately cease. You may also 
              terminate your account at any time through your account settings.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Hypz shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use or inability to use the Service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes 
              via email or through the Service. Your continued use of the Service after such modifications 
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:{' '}
              <a href="mailto:legal@hypz.com" className="text-primary-600 hover:text-primary-700 font-medium underline">
                legal@hypz.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
