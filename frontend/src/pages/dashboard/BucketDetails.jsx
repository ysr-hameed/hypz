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
