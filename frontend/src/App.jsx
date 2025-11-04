import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlanProvider } from './context/PlanContext';
import { UserProvider, useUser } from './context/UserContext';
import { useEffect, useState } from 'react';
import FullPageLoader from './components/FullPageLoader';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPasswordProtection from './components/AdminPasswordProtection';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import GoogleCallback from './pages/auth/GoogleCallback';
import GithubCallback from './pages/auth/GithubCallback';
import Dashboard from './pages/dashboard/Dashboard';
import Buckets from './pages/dashboard/Buckets';
import BucketDetails from './pages/dashboard/BucketDetails';
import FileManager from './pages/dashboard/FileManager';
import Pricing from './pages/Pricing';
import Documentation from './pages/Documentation';
import Billing from './pages/dashboard/Billing';
import Settings from './pages/dashboard/Settings';
import ApiKeys from './pages/dashboard/ApiKeys';
import Usage from './pages/dashboard/Usage';
// import Documentation from './pages/dashboard/Documentation';
import Team from './pages/dashboard/Team';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/Users';
import AdminBucketsPage from './pages/admin/Buckets';
import AdminFilesPage from './pages/admin/Files';
import AdminStoragePage from './pages/admin/Storage';
import AdminBillingPage from './pages/admin/Billing';
import AdminPlansPage from './pages/admin/Plans';
import AdminApiKeysPage from './pages/admin/ApiKeys';
import AdminActivityPage from './pages/admin/Activity';
import AdminAnalyticsPage from './pages/admin/Analytics';
import AdminNotificationsPage from './pages/admin/Notifications';
import AdminSecurityPage from './pages/admin/Security';
import AdminCorsPage from './pages/admin/Cors';
import AdminWebhooksPage from './pages/admin/Webhooks';
import AdminSettingsPage from './pages/admin/Settings';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Security from './pages/legal/Security';
import Compliance from './pages/legal/Compliance';
import About from './pages/company/About';
import Blog from './pages/company/Blog';
import Careers from './pages/company/Careers';
import Contact from './pages/company/Contact';
import Api from './pages/Api';

// App content that shows after initial load
function AppContent() {
  const { loading: userLoading } = useUser();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Mark initial load as complete after user data is loaded
    if (!userLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userLoading]);

  // Show full page loader during initial app load
  if (!initialLoadComplete) {
    return <FullPageLoader message="Initializing application..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
              <Route element={<LandingLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/docs" element={<Documentation />} />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/callback/google" element={<GoogleCallback />} />
                <Route path="/auth/callback/github" element={<GithubCallback />} />
              </Route>

            {/* Legal Routes */}
            <Route element={<LandingLayout />}>
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/security" element={<Security />} />
              <Route path="/compliance" element={<Compliance />} />
            </Route>

            {/* Company Routes */}
            <Route element={<LandingLayout />}>
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/api" element={<Api />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/file-manager" element={<FileManager />} />
              <Route path="/buckets" element={<Buckets />} />
              <Route path="/buckets/:bucketId" element={<BucketDetails />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/api-keys" element={<ApiKeys />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Admin Panel with Sidebar - Protected with admin role + password */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPasswordProtection>
                  <AdminLayout />
                </AdminPasswordProtection>
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="buckets" element={<AdminBucketsPage />} />
              <Route path="files" element={<AdminFilesPage />} />
              <Route path="storage" element={<AdminStoragePage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route path="api-keys" element={<AdminApiKeysPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="security" element={<AdminSecurityPage />} />
              <Route path="cors" element={<AdminCorsPage />} />
              <Route path="webhooks" element={<AdminWebhooksPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Router>
      );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PlanProvider>
          <AppContent />
        </PlanProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
