import { Link } from 'react-router-dom';
import { Award, CheckCircle, FileCheck, Globe, Shield } from 'lucide-react';

const Compliance = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Award className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Compliance & Certifications
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Meeting the highest standards for security and privacy
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Hypz is committed to maintaining the highest standards of security, privacy, and compliance. 
              We undergo regular audits and maintain certifications that demonstrate our commitment to protecting 
              your data and meeting regulatory requirements.
            </p>
          </div>

          {/* SOC 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  SOC 2 Type II Certified
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our SOC 2 Type II certification demonstrates that our systems and processes meet rigorous 
                  standards for security, availability, processing integrity, confidentiality, and privacy.
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Annual independent audits by certified third-party auditors</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Continuous monitoring of security controls and processes</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Reports available to customers under NDA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GDPR */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  GDPR Compliant
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We comply with the European Union's General Data Protection Regulation (GDPR), 
                  ensuring the protection and privacy of EU citizens' data.
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Data Processing Agreements (DPA) available</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Right to access, rectification, and erasure of personal data</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>EU data residency options available</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Privacy by design and default</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ISO 27001 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ISO 27001 Certified
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our ISO 27001 certification demonstrates our commitment to implementing and maintaining 
                  an Information Security Management System (ISMS) that meets international standards.
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Systematic approach to managing sensitive information</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Risk assessment and treatment processes</span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Regular internal and external audits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Compliance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Additional Compliance
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  CCPA Compliant
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  California Consumer Privacy Act compliance for California residents
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  HIPAA Ready
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Business Associate Agreements available for healthcare applications
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  PCI DSS
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Payment card data protection for secure transactions
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Data Residency
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose where your data is stored to meet local regulations
                </p>
              </div>
            </div>
          </div>

          {/* Request Documentation */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Request Compliance Documentation</h2>
            <p className="mb-6 opacity-90">
              Need compliance certificates or audit reports for your security review? Contact our team.
            </p>
            <Link
              to="/contact"
              className="inline-block px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Contact Compliance Team
            </Link>
          </div>

          {/* Security Practices */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Security Best Practices
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Beyond certifications, we implement industry best practices:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Regular penetration testing and vulnerability assessments</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Employee security training and background checks</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Incident response and disaster recovery plans</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Vendor security assessments</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Security bug bounty program</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center space-x-4">
          <Link to="/security" className="text-primary-600 hover:text-primary-700 font-medium">
            Security
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
