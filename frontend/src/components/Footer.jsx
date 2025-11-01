import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Zap, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Hypz
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modern object storage solution for developers. Fast, secure, and scalable.
            </p>
            <div className="flex space-x-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 transition">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 transition">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 transition">
                <Linkedin size={18} />
              </a>
              <a href="mailto:contact@hypz.com" className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 transition">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Features</a></li>
              <li><Link to="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Pricing</Link></li>
              <li><Link to="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Documentation</Link></li>
              <li><Link to="/api" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">API Reference</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">About Us</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Terms of Service</Link></li>
              <li><Link to="/security" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Security</Link></li>
              <li><Link to="/compliance" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Hypz. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            <span>for developers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
