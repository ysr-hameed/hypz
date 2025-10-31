import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
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
import Team from './pages/dashboard/Team';
import Usage from './pages/dashboard/Usage';
import Documentation from './pages/dashboard/Documentation';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/buckets" element={<Buckets />} />
            <Route path="/buckets/:bucketId" element={<BucketDetails />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/team" element={<Team />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/docs" element={<Documentation />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
