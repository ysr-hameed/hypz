import { useState, useEffect } from 'react';
import { Bell, Send, Users, Trash2, Filter, Calendar, TrendingUp } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../../utils/logger';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    isGlobal: ''
  });

  // Form state for creating notification
  const [notificationForm, setNotificationForm] = useState({
    type: 'info',
    title: '',
    message: '',
    link: '',
    icon: '',
    priority: 'normal',
    isGlobal: false,
    userEmails: '',
    expiresAt: ''
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchNotifications();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        type: filters.type || undefined,
        isGlobal: filters.isGlobal || undefined
      };
      const response = await notificationAPI.getAllNotifications(params);
      setNotifications(response.data);
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getStats();
      setStats(response.data);
    } catch (error) {
      logger.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const notificationData = {
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        link: notificationForm.link || undefined,
        icon: notificationForm.icon || undefined,
        priority: notificationForm.priority,
        isGlobal: notificationForm.isGlobal,
        expiresAt: notificationForm.expiresAt || undefined
      };

      if (notificationForm.isGlobal) {
        // Send global notification
        await notificationAPI.createNotification(notificationData);
        alert('Global notification sent successfully!');
      } else {
        // Send to specific users
        const emails = notificationForm.userEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email);
        
        if (emails.length === 0) {
          alert('Please enter at least one email address');
          return;
        }

        await notificationAPI.sendBulkNotification({
          ...notificationData,
          userEmails: emails
        });
        alert(`Notification sent to ${emails.length} user(s)!`);
      }

      // Reset form
      setNotificationForm({
        type: 'info',
        title: '',
        message: '',
        link: '',
        icon: '',
        priority: 'normal',
        isGlobal: false,
        userEmails: '',
        expiresAt: ''
      });
    } catch (error) {
      logger.error('Failed to send notification:', error);
      alert(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationAPI.deleteNotificationAdmin(notificationId);
      fetchNotifications();
      alert('Notification deleted successfully');
    } catch (error) {
      logger.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      announcement: '📢'
    };
    return icons[type] || '📬';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notification Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send notifications to users and track engagement
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-6 py-3 font-medium text-sm transition ${
              activeTab === 'send'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Send className="inline-block mr-2" size={18} />
            Send Notification
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium text-sm transition ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bell className="inline-block mr-2" size={18} />
            History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium text-sm transition ${
              activeTab === 'stats'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="inline-block mr-2" size={18} />
            Statistics
          </button>
        </div>

        {/* Send Notification Tab */}
        {activeTab === 'send' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSendNotification} className="space-y-6">
              {/* Global vs Targeted */}
              <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="isGlobal"
                  name="isGlobal"
                  checked={notificationForm.isGlobal}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label htmlFor="isGlobal" className="flex items-center cursor-pointer">
                  <Users className="mr-2" size={20} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Send to all users (Global Announcement)
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      This notification will be visible to everyone
                    </div>
                  </div>
                </label>
              </div>

              {/* User Emails (if not global) */}
              {!notificationForm.isGlobal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Emails (comma-separated)
                  </label>
                  <textarea
                    name="userEmails"
                    value={notificationForm.userEmails}
                    onChange={handleInputChange}
                    placeholder="user1@example.com, user2@example.com"
                    rows="3"
                    required={!notificationForm.isGlobal}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Type & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={notificationForm.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={notificationForm.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={notificationForm.title}
                  onChange={handleInputChange}
                  placeholder="Notification title"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={notificationForm.message}
                  onChange={handleInputChange}
                  placeholder="Notification message"
                  rows="4"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Link & Icon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link (optional)
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={notificationForm.link}
                    onChange={handleInputChange}
                    placeholder="/dashboard/settings"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (optional)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={notificationForm.icon}
                    onChange={handleInputChange}
                    placeholder="🎉"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiration Date (optional)
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={notificationForm.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="mr-2" size={20} />
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-4">
                <Filter size={20} className="text-gray-600 dark:text-gray-400" />
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>

                <select
                  value={filters.isGlobal}
                  onChange={(e) => setFilters(prev => ({ ...prev, isGlobal: e.target.value }))}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Notifications</option>
                  <option value="true">Global Only</option>
                  <option value="false">Targeted Only</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                  No notifications found
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              {notification.is_global && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-xs font-medium">
                                  Global
                                </span>
                              )}
                              <span>•</span>
                              <Calendar size={14} />
                              <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        {notification.user_email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Sent to: {notification.user_email}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full p-8 text-center text-gray-600 dark:text-gray-400">
                Loading statistics...
              </div>
            ) : stats ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Notifications</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNotifications}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Unread</div>
                  <div className="text-3xl font-bold text-orange-600">{stats.unreadNotifications}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Global Announcements</div>
                  <div className="text-3xl font-bold text-purple-600">{stats.globalNotifications}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Last 24 Hours</div>
                  <div className="text-3xl font-bold text-green-600">{stats.last24Hours}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">Last 7 Days</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.last7Days}</div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
