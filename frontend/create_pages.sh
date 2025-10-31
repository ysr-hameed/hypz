#!/bin/bash

# Create all remaining dashboard pages

# Buckets Page
cat > "/home/ysr/VS Code Projects/hypz/frontend/src/pages/dashboard/Buckets.jsx" << 'EOF'
import { Plus, Database, Calendar, HardDrive, MoreVertical, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

const Buckets = () => {
  const buckets = [
    { id: '1', name: 'my-images', files: 245, size: '85 MB', created: '2024-01-15', public: true },
    { id: '2', name: 'documents', files: 128, size: '42 MB', created: '2024-02-20', public: false },
    { id: '3', name: 'backups', files: 89, size: '156 MB', created: '2024-03-10', public: false },
    { id: '4', name: 'user-uploads', files: 512, size: '228 MB', created: '2024-03-25', public: true },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buckets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your storage buckets</p>
        </div>
        <button className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
          <Plus size={20} className="mr-2" />
          Create Bucket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buckets.map((bucket) => (
          <Link
            key={bucket.id}
            to={`/buckets/${bucket.id}`}
            className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <MoreVertical size={18} />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-mono mb-2">{bucket.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Folder size={16} className="mr-2" />
                {bucket.files} files
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <HardDrive size={16} className="mr-2" />
                {bucket.size}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} className="mr-2" />
                {bucket.created}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${bucket.public ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {bucket.public ? 'Public' : 'Private'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Buckets;
EOF

# BucketDetails Page
cat > "/home/ysr/VS Code Projects/hypz/frontend/src/pages/dashboard/BucketDetails.jsx" << 'EOF'
import { ArrowLeft, Upload, Download, Trash2, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Link } from 'react-router-dom';

const BucketDetails = () => {
  const files = [
    { name: 'avatar.png', type: 'image', size: '245 KB', modified: '2 hours ago', url: '#' },
    { name: 'document.pdf', type: 'file', size: '1.2 MB', modified: '1 day ago', url: '#' },
    { name: 'data.json', type: 'file', size: '85 KB', modified: '3 days ago', url: '#' },
    { name: 'banner.jpg', type: 'image', size: '890 KB', modified: '1 week ago', url: '#' },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      <div className="flex items-center space-x-4">
        <Link to="/buckets" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">my-images</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">245 files • 85 MB</p>
        </div>
        <button className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50">
          <Upload size={20} className="mr-2" />
          Upload Files
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modified</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {files.map((file, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {file.type === 'image' ? (
                      <ImageIcon size={18} className="mr-3 text-blue-500" />
                    ) : (
                      <FileText size={18} className="mr-3 text-gray-400" />
                    )}
                    <span className="text-sm font-medium font-mono text-gray-900 dark:text-white">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{file.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{file.modified}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-primary-600">
                      <Download size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BucketDetails;
EOF

# Plans Page - The most important one with your pricing!
cat > "/home/ysr/VS Code Projects/hypz/frontend/src/pages/dashboard/Plans.jsx" << 'EOF'
import { Check, Zap, TrendingUp, Bell, CreditCard } from 'lucide-react';

const Plans = () => {
  return (
    <div className="space-y-8 animate-slideIn max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Start free, scale as you grow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🧪 Free Plan</h2>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full">
              ACTIVE
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for students, developers, or teams testing Hypz APIs before going live.</p>
          
          <div className="mb-8">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">₹0</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">forever</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">💾 500 MB Storage</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Permanent file storage</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">🌐 1 GB Bandwidth / month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly download quota</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">⚙️ 10,000 API Calls / month</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload, list, delete, and access APIs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">📅 Lifetime Validity</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">For testing only - May slow after 30 days inactive</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">💸 No Card Required</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start immediately</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">🎁 Launch Bonus</p>
                <p className="text-sm text-green-600 dark:text-green-400">+500 MB extra storage for first 30 days!</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pay-As-You-Go Plan */}
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
              ⭐ POPULAR
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">💰 Pay-As-You-Go Plan</h2>
          <p className="text-white/90 mb-6">No monthly commitment — just top-up your wallet and pay for actual usage.</p>
          
          <div className="mb-8">
            <span className="text-5xl font-bold text-white">Usage Based</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">💾 ₹5 / GB / month</p>
                <p className="text-sm text-white/80">Storage - Billed daily, charged monthly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🌐 ₹10 / GB</p>
                <p className="text-sm text-white/80">Bandwidth - Pay for file delivery/download</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">⚙️ ₹0.02 / 100 calls</p>
                <p className="text-sm text-white/80">API Calls - First 10,000 free every month</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">�� ₹10 Minimum Bill</p>
                <p className="text-sm text-white/80">Only when usage exceeds free tier</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🔄 30-Day Billing Cycle</p>
                <p className="text-sm text-white/80">Auto-deduct from Razorpay wallet or card</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Bell size={20} className="text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">🔔 Usage Alerts</p>
                <p className="text-sm text-white/90">Email/SMS at 80% usage - Prevent surprise billing</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-primary-600 rounded-lg font-medium transition shadow-xl">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Free Plan</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Pay-As-You-Go</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Storage</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">500 MB</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Bandwidth</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">1 GB/month</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">API Calls</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">10,000/month</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">CDN</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">SSL/TLS</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Priority Support</td>
                <td className="py-3 px-4 text-center text-gray-400">-</td>
                <td className="py-3 px-4 text-center"><Check className="mx-auto text-green-500" size={20} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Plans;
EOF

echo "Dashboard pages created successfully!"
