import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Database, TrendingUp, FileText, Activity } from 'lucide-react';
import { usageAPI, filesAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [usageRes, statsRes] = await Promise.all([
        usageAPI.getCurrent(),
        filesAPI.getStats(),
      ]);

      setUsage(usageRes.data.data);
      setFileStats(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Overview of your storage usage and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatBytes(usage?.current?.storage || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {usage?.percentage?.storage}% of {formatBytes(usage?.limits?.storage || 0)}
                </p>
              </div>
              <Database className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${Math.min(usage?.percentage?.storage || 0, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bandwidth</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatBytes(usage?.current?.bandwidth || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {usage?.percentage?.bandwidth}% used
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(usage?.percentage?.bandwidth || 0, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {fileStats?.totalFiles || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {fileStats?.totalDownloads || 0} downloads
                </p>
              </div>
              <FileText className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">API Calls</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {usage?.current?.apiCalls?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {usage?.percentage?.apiCalls}% used
                </p>
              </div>
              <Activity className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(usage?.percentage?.apiCalls || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/files')}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all text-gray-700 dark:text-gray-300"
            >
              <FileText className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Manage Files</p>
            </button>
            <button
              onClick={() => router.push('/billing')}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all text-gray-700 dark:text-gray-300"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Upgrade Plan</p>
            </button>
            <button
              onClick={() => router.push('/docs')}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all text-gray-700 dark:text-gray-300"
            >
              <Database className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">View Documentation</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
