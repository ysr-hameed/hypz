import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlanProvider } from './context/PlanContext';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import EnvIndicator from './components/EnvIndicator';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
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

function App() {
  return (
    <ThemeProvider>
      <PlanProvider>
        <Router>
          <EnvIndicator />
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
