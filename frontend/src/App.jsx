import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlanProvider } from './context/PlanContext';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
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
import Plans from './pages/dashboard/Plans';
import Billing from './pages/dashboard/Billing';
import Settings from './pages/dashboard/Settings';
import ApiKeys from './pages/dashboard/ApiKeys';
import Usage from './pages/dashboard/Usage';
import Documentation from './pages/dashboard/Documentation';
import Team from './pages/dashboard/Team';
import AdminDashboard from './pages/admin/AdminDashboard';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Security from './pages/legal/Security';
import Compliance from './pages/legal/Compliance';
import About from './pages/company/About';
import Blog from './pages/company/Blog';
import Careers from './pages/company/Careers';
import Contact from './pages/company/Contact';
import Api from './pages/Api';

function App() {
  return (
    <ThemeProvider>
      <PlanProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/pricing" element={<Plans />} />
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
              <Route path="/buckets" element={<Buckets />} />
              <Route path="/buckets/:bucketId" element={<BucketDetails />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/api-keys" element={<ApiKeys />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Admin Panel (Separate full-page layout, no sidebar) */}
            <Route path="/admin-panel" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </PlanProvider>
    </ThemeProvider>
  );
}

export default App;
