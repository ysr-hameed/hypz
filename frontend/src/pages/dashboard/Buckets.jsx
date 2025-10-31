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
