import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Eye, Server, AlertTriangle, CheckCircle } from 'lucide-react';

const Security = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Security at Hypz
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your data security is our top priority
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At Hypz, we employ multiple layers of security to protect your data. Our infrastructure is designed 
              with security at its core, following industry best practices and compliance standards.
            </p>
          </div>

          {/* Encryption */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Encryption</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Encryption in Transit (TLS 1.3)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All data transmitted between your application and Hypz is encrypted using TLS 1.3, 
                    the latest and most secure encryption protocol.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Encryption at Rest (AES-256)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    All files stored in Hypz are encrypted using AES-256 encryption, 
                    the same standard used by banks and government agencies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Control</h2>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>API Key Authentication:</strong> Secure API keys with configurable permissions</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>Role-Based Access Control (RBAC):</strong> Fine-grained permissions for team members</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>Two-Factor Authentication:</strong> Optional 2FA for enhanced account security</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p><strong>IP Whitelisting:</strong> Restrict access to specific IP addresses</p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Security</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Network Security</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Firewalls, DDoS protection, and network segmentation
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Centers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  SOC 2 Type II certified facilities with 24/7 monitoring
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Redundancy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Multi-region replication and automatic failover
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Backups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Automated backups with point-in-time recovery
                </p>
              </div>
            </div>
          </div>

          {/* Monitoring */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Monitoring</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Our security team monitors our systems 24/7 for potential threats and vulnerabilities:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Real-time intrusion detection and prevention systems</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Automated vulnerability scanning and patching</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Security audit logs with tamper-proof storage</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Incident response team on standby</span>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We maintain compliance with industry standards and regulations:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <div className="font-semibold text-gray-900 dark:text-white">SOC 2 Type II</div>
              </div>
              <div className="text-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl mb-2">🇪🇺</div>
                <div className="font-semibold text-gray-900 dark:text-white">GDPR</div>
              </div>
              <div className="text-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="text-2xl mb-2">🔐</div>
                <div className="font-semibold text-gray-900 dark:text-white">ISO 27001</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Learn more about our compliance on our{' '}
              <Link to="/compliance" className="text-primary-600 hover:text-primary-700 underline">
                Compliance page
              </Link>
            </p>
          </div>

          {/* Responsible Disclosure */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Responsible Disclosure
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you discover a security vulnerability, please report it to our security team at{' '}
              <a href="mailto:security@hypz.com" className="text-primary-600 hover:text-primary-700 font-medium underline">
                security@hypz.com
              </a>
              . We take all security reports seriously and will respond promptly.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center space-x-4">
          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/compliance" className="text-primary-600 hover:text-primary-700 font-medium">
            Compliance
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

export default Security;
