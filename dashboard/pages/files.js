import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { Upload } from 'lucide-react';
import FileTable from '../components/FileTable';
import { filesAPI } from '../lib/api';
import { useEffect } from 'react';
import { isAuthenticated } from '../lib/auth';

export default function Files() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchFiles();
  }, [router]);

  const fetchFiles = async () => {
    try {
      const response = await filesAPI.getFiles();
      setFiles(response.data.data);
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await filesAPI.upload(formData);
      toast.success('File uploaded successfully!');
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    setLoading(true);
    try {
      const response = await filesAPI.downloadFile(file.id);
      window.open(response.data.data.downloadUrl, '_blank');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.filename}?`)) return;

    setLoading(true);
    try {
      await filesAPI.deleteFile(file.id);
      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Files
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your uploaded files
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50">
              <Upload className="w-5 h-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </div>
          </label>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <FileTable
            files={files}
            onDownload={handleDownload}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
