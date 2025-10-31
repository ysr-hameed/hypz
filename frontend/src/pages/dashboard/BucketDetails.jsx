import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Trash2, Copy, ExternalLink, MoreVertical, File, Image, FileText, Film } from 'lucide-react';
import { useState } from 'react';

const BucketDetails = () => {
  const { bucketId } = useParams();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const files = [
    { name: 'avatar.png', size: '245 KB', type: 'image', modified: '2024-03-20 14:30', url: 'https://cdn.hypz.com/...' },
    { name: 'document.pdf', size: '1.2 MB', type: 'document', modified: '2024-03-19 10:15', url: 'https://cdn.hypz.com/...' },
    { name: 'video.mp4', size: '15.8 MB', type: 'video', modified: '2024-03-18 16:45', url: 'https://cdn.hypz.com/...' },
    { name: 'data.json', size: '89 KB', type: 'file', modified: '2024-03-17 09:20', url: 'https://cdn.hypz.com/...' },
    { name: 'banner.jpg', size: '567 KB', type: 'image', modified: '2024-03-16 11:00', url: 'https://cdn.hypz.com/...' },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Film className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/buckets" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Buckets
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{bucketId}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{files.length} files • 18.1 MB used</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
          >
            <Upload size={20} className="mr-2" />
            Upload Files
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {files.map((file, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {file.modified}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        title="Copy URL"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        title="Open"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        title="Download"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <Download size={16} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        title="Delete"
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Files</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Any file up to 100MB
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketDetails;
