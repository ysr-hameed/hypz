import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Trash2, Copy, ExternalLink, MoreVertical, File, Image, FileText, Film, Music, Archive, Code, X, Loader, AlertCircle, FolderOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { bucketAPI, fileAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const BucketDetails = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [bucket, setBucket] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, fileId: null, fileName: '' });

  useEffect(() => {
    fetchBucketDetails();
    fetchFiles();
  }, [bucketId]);

  const fetchBucketDetails = async () => {
    try {
      const response = await bucketAPI.getById(bucketId);
      setBucket(response.data);
    } catch (error) {
      console.error('Failed to fetch bucket details:', error);
      toast.error('Failed to load bucket details');
      if (error.response?.status === 404) {
        navigate('/buckets');
      }
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.getAll(bucketId);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    if (files.length > 0) {
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      setUploading(true);
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        await fileAPI.upload(bucketId, formData, (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        });
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
      setShowUploadModal(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      fetchFiles();
      fetchBucketDetails();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (fileId, fileName) => {
    setConfirmModal({ isOpen: true, fileId, fileName });
  };

  const confirmDelete = async () => {
    try {
      await fileAPI.delete(confirmModal.fileId);
      toast.success('File deleted successfully');
      fetchFiles();
      fetchBucketDetails();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fileAPI.download(fileId);
      const url = response.data.downloadUrl;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };

  const copyToClipboard = (text, label = 'URL') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <File className="w-5 h-5" />;
    
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Film className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-5 h-5" />;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <Archive className="w-5 h-5" />;
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) return <Code className="w-5 h-5" />;
    
    return <File className="w-5 h-5" />;
  };

  const getFileColor = (mimeType) => {
    if (!mimeType) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    
    if (mimeType.startsWith('image/')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
    if (mimeType.startsWith('video/')) return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    if (mimeType.startsWith('audio/')) return 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
    
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  if (loading && !bucket) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 content-wrapper content-loaded">
      {/* Header */}
      <div>
        <Link to="/buckets" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition">
          <ArrowLeft size={16} className="mr-1" />
          Back to Buckets
        </Link>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{bucket?.name}</h1>
            {bucket?.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{bucket.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{parseInt(bucket?.file_count || 0).toLocaleString()} files</span>
              <span>•</span>
              <span className="font-mono">{formatBytes(parseInt(bucket?.total_size || 0))}</span>
              <span>•</span>
              <span className="capitalize">{bucket?.visibility}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/file-manager?bucket=${bucketId}`}
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition"
            >
              <FolderOpen size={20} className="mr-2" />
              File Manager
            </Link>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50"
            >
              <Upload size={20} className="mr-2" />
              Upload Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Files Section */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No files yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your first file to get started
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition"
          >
            <Upload size={20} className="mr-2" />
            Upload Files
          </button>
        </div>
      ) : (
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
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.mime_type)}`}>
                          {getFileIcon(file.mime_type)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm block">
                            {file.original_name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                            {file.extension}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.url, 'URL')}
                          title="Copy URL"
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition"
                        >
                          <Copy size={16} />
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in new tab"
                          className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDownload(file.id, file.original_name)}
                          title="Download"
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg transition"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.original_name)}
                          title="Delete"
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                        >
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
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Files</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setUploadProgress(0);
                }}
                disabled={uploading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected Files List */}
              <div className="max-h-64 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded transition ml-2"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="font-medium text-gray-900 dark:text-white">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-purple-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Files will be uploaded to <strong>{bucket?.name}</strong> bucket
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                    setUploadProgress(0);
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, fileId: null, fileName: '' })}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${confirmModal.fileName}"? This action cannot be undone.`}
        confirmText="Delete File"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon={Trash2}
        iconColor="text-red-600"
      />
    </div>
  );
};

export default BucketDetails;
