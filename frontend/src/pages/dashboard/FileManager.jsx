import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Search,
  Grid,
  List,
  ArrowLeft,
  MoreVertical,
  FolderOpen,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  Code,
  X,
  Loader,
  AlertCircle,
  HardDrive,
  Filter,
  SortAsc,
  Eye,
  RefreshCw
} from 'lucide-react';
import { bucketAPI, fileAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const FileManager = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // URL params for navigation
  const bucketId = searchParams.get('bucket');
  const folderId = searchParams.get('folder');

  // State
  const [buckets, setBuckets] = useState([]);
  const [currentBucket, setCurrentBucket] = useState(null);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'All Buckets', path: null }]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size', 'type'
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'videos', 'documents', etc.
  
  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, name: '' });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, item: null });

  // Fetch data based on current view
  useEffect(() => {
    if (!bucketId) {
      fetchBuckets();
    } else {
      fetchBucketContents();
    }
  }, [bucketId, folderId, searchQuery, sortBy, filterType]);

  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const response = await bucketAPI.getAll({ search: searchQuery });
      // Backend returns: { success, message, data: { buckets: [], pagination: {} } }
      setBuckets(response?.data?.buckets || []);
      setBreadcrumbs([{ name: 'All Buckets', path: null }]);
    } catch (error) {
      toast.error('Failed to load buckets');
      logger.error('Error fetching buckets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBucketContents = async () => {
    setLoading(true);
    try {
      // Fetch bucket details
      const bucketResponse = await bucketAPI.getById(bucketId);
      // Backend returns: { success, message, data: bucketObject }
      const bucket = bucketResponse?.data || bucketResponse;
      setCurrentBucket(bucket);

      // Fetch files in bucket
      const filesResponse = await fileAPI.getAll(bucketId);
      // Backend returns: { success, message, data: { files: [], pagination: {} } }
      let fetchedFiles = filesResponse?.data?.files || [];

      // Apply filters
      if (filterType !== 'all') {
        fetchedFiles = fetchedFiles.filter(file => {
          const type = getFileCategory(file.mime_type);
          return type === filterType;
        });
      }

      // Apply search
      if (searchQuery) {
        fetchedFiles = fetchedFiles.filter(file => 
          file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply sorting
      fetchedFiles = sortFiles(fetchedFiles, sortBy);

      setFiles(fetchedFiles);

      // Update breadcrumbs
      setBreadcrumbs([
        { name: 'All Buckets', path: null },
        { name: bucket.name, path: bucketId }
      ]);
    } catch (error) {
      toast.error('Failed to load bucket contents');
      logger.error('Error fetching bucket contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortFiles = (fileList, sortType) => {
    const sorted = [...fileList];
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) => a.original_name.localeCompare(b.original_name));
      case 'date':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'size':
        return sorted.sort((a, b) => b.size - a.size);
      case 'type':
        return sorted.sort((a, b) => a.mime_type.localeCompare(b.mime_type));
      default:
        return sorted;
    }
  };

  const getFileCategory = (mimeType) => {
    if (!mimeType) return 'other';
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'documents';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archives';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) return 'code';
    return 'other';
  };

  const handleBucketClick = (bucket) => {
    setSearchParams({ bucket: bucket.id });
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      setSearchParams({});
    } else {
      const crumb = breadcrumbs[index];
      if (crumb.path) {
        setSearchParams({ bucket: crumb.path });
      }
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
    if (selectedFiles.length === 0 || !bucketId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload files sequentially with better progress tracking
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        // Calculate progress for multiple files
        const fileProgressStart = (i / selectedFiles.length) * 100;
        const fileProgressRange = 100 / selectedFiles.length;

        // Simulate smooth progress for better UX
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
          simulatedProgress += 5;
          if (simulatedProgress < 90) {
            const totalProgress = fileProgressStart + (simulatedProgress / 100) * fileProgressRange;
            setUploadProgress(Math.round(totalProgress));
          }
        }, 100);

        try {
          await fileAPI.upload(bucketId, formData, (progressEvent) => {
            clearInterval(progressInterval);
            if (progressEvent && progressEvent.total) {
              const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              const totalProgress = fileProgressStart + (fileProgress / 100) * fileProgressRange;
              setUploadProgress(Math.round(totalProgress));
            }
          });
        } finally {
          clearInterval(progressInterval);
        }

        // Set progress to complete for this file
        setUploadProgress(Math.round(fileProgressStart + fileProgressRange));
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      setShowUploadModal(false);
      setSelectedFiles([]);
      setUploadProgress(0);
      fetchBucketContents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload files');
      logger.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fileAPI.download(fileId);
      const url = response.downloadUrl;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
      logger.error('Download error:', error);
    }
  };

  const handleDelete = (type, id, name) => {
    setConfirmModal({ isOpen: true, type, id, name });
  };

  const confirmDelete = async () => {
    const { type, id } = confirmModal;
    try {
      if (type === 'bucket') {
        await bucketAPI.delete(id);
        toast.success('Bucket deleted successfully');
        setSearchParams({});
      } else if (type === 'file') {
        await fileAPI.delete(id);
        toast.success('File deleted successfully');
        fetchBucketContents();
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
      logger.error('Delete error:', error);
    } finally {
      setConfirmModal({ isOpen: false, type: '', id: null, name: '' });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const showDetails = (item) => {
    setDetailsModal({ isOpen: true, item });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType, size = 20) => {
    const category = getFileCategory(mimeType);
    const props = { size, className: 'flex-shrink-0' };
    
    switch (category) {
      case 'images': return <Image {...props} />;
      case 'videos': return <Film {...props} />;
      case 'audio': return <Music {...props} />;
      case 'documents': return <FileText {...props} />;
      case 'archives': return <Archive {...props} />;
      case 'code': return <Code {...props} />;
      default: return <File {...props} />;
    }
  };

  const getFileColor = (mimeType) => {
    const category = getFileCategory(mimeType);
    
    switch (category) {
      case 'images': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'videos': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'audio': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
      case 'documents': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'archives': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'code': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <HardDrive className="text-primary-600" size={32} />
              File Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your buckets, folders, and files
            </p>
          </div>

          {bucketId && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition shadow-lg shadow-primary-500/50 flex items-center gap-2"
            >
              <Upload size={20} />
              Upload Files
            </button>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                } transition`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={bucketId ? "Search files..." : "Search buckets..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* Filter */}
            {bucketId && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="videos">Videos</option>
                <option value="audio">Audio</option>
                <option value="documents">Documents</option>
                <option value="archives">Archives</option>
                <option value="code">Code</option>
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>

            {/* View Mode */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} transition`}
              >
                <Grid size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} transition`}
              >
                <List size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => bucketId ? fetchBucketContents() : fetchBuckets()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : !bucketId ? (
        /* Buckets Grid */
        buckets.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No buckets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first bucket to start storing files
            </p>
            <button
              onClick={() => navigate('/buckets')}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium transition"
            >
              <Folder size={20} className="mr-2" />
              Go to Buckets
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
            {buckets.map((bucket) => (
              <div
                key={bucket.id}
                onClick={() => handleBucketClick(bucket)}
                className={`${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-primary-500 dark:hover:border-primary-400 transition cursor-pointer group'
                    : 'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-primary-500 dark:hover:border-primary-400 transition cursor-pointer flex items-center gap-4'
                }`}
              >
                <div className={`${viewMode === 'grid' ? 'mb-4' : ''}`}>
                  <div className={`${viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12'} bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition`}>
                    <FolderOpen className="text-primary-600 dark:text-primary-400" size={viewMode === 'grid' ? 32 : 24} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`${viewMode === 'grid' ? 'text-lg' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-1`}>
                    {bucket.name}
                  </h3>
                  {bucket.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {bucket.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <File size={14} />
                      {bucket.file_count || 0} files
                    </span>
                    <span className="font-mono">
                      {formatBytes(bucket.total_size || 0)}
                    </span>
                  </div>
                </div>
                {viewMode === 'list' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete('bucket', bucket.id, bucket.name);
                    }}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Files Grid/List */
        files.length === 0 ? (
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-primary-500 dark:hover:border-primary-400 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(file.mime_type)}`}>
                    {getFileIcon(file.mime_type, 24)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => showDetails(file)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition opacity-0 group-hover:opacity-100"
                      title="Details"
                    >
                      <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDownload(file.id, file.original_name)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition opacity-0 group-hover:opacity-100"
                      title="Download"
                    >
                      <Download size={14} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete('file', file.id, file.original_name)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate" title={file.original_name}>
                  {file.original_name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-mono">{formatBytes(file.size)}</span>
                  <span>{file.extension}</span>
                </div>
              </div>
            ))}
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
                            onClick={() => handleDelete('file', file.id, file.original_name)}
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
        )
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
                  Files will be uploaded to <strong>{currentBucket?.name}</strong> bucket
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

      {/* Details Modal */}
      {detailsModal.isOpen && detailsModal.item && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Details</h2>
              <button
                onClick={() => setDetailsModal({ isOpen: false, item: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-lg flex items-center justify-center ${getFileColor(detailsModal.item.mime_type)}`}>
                {getFileIcon(detailsModal.item.mime_type, 40)}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{detailsModal.item.original_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{detailsModal.item.mime_type}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Size</label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{formatBytes(detailsModal.item.size)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Uploaded</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(detailsModal.item.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">URL</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 dark:text-white font-mono truncate flex-1">{detailsModal.item.url}</p>
                    <button
                      onClick={() => copyToClipboard(detailsModal.item.url, 'URL')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                    >
                      <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', id: null, name: '' })}
        onConfirm={confirmDelete}
        title={`Delete ${confirmModal.type === 'bucket' ? 'Bucket' : 'File'}`}
        message={`Are you sure you want to delete "${confirmModal.name}"? This action cannot be undone.`}
        confirmText={`Delete ${confirmModal.type === 'bucket' ? 'Bucket' : 'File'}`}
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon={Trash2}
        iconColor="text-red-600"
      />
    </div>
  );
};

export default FileManager;
