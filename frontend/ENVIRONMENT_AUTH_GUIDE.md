# Environment-Based Authentication Setup

## Overview
The application now supports environment-based authentication:
- **Development Mode**: Authentication bypassed - access all routes freely
- **Production Mode**: Full authentication required - protected routes need login

## How It Works

### Development Mode (npm run dev)
- ✅ All routes accessible without login
- ✅ No need to set auth token
- ✅ Console shows: `🔓 Development Mode: Authentication bypassed`
- Perfect for testing and development

### Production Mode (npm run build + preview)
- 🔒 Protected routes require authentication
- 🔒 Must have valid `authToken` in localStorage
- 🔒 Redirects to `/login` if not authenticated
- Console shows: `🔒 Production Mode: No auth token found`

## Environment Variables

### Location
- Development: `.env.development`
- Production: `.env.production`
- Example: `.env.example`

### Key Variables

```env
# Bypass authentication in development (default: true)
VITE_BYPASS_AUTH_IN_DEV=true

# API endpoint
VITE_API_URL=http://localhost:3000/api

# Enable mock data
VITE_ENABLE_MOCK_DATA=true

# Payment providers
VITE_RAZORPAY_KEY=your_key_here
VITE_LEMON_SQUEEZY_KEY=your_key_here

# OAuth credentials
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_MICROSOFT_CLIENT_ID=your_client_id_here
```

## Configuration File

**File**: `src/config/env.js`

Centralizes all environment configuration:
```javascript
import { shouldBypassAuth } from '../config/env';

if (shouldBypassAuth()) {
  // Development mode - no auth needed
}
```

## Protected Routes

All dashboard routes are protected:
- `/dashboard` - Main dashboard
- `/buckets` - Bucket management
- `/billing` - Billing & invoices
- `/usage` - Usage statistics
- `/api-keys` - API key management
- `/team` - Team management
- `/settings` - User settings
- `/admin` - Admin panel

## Public Routes

Always accessible (no auth needed):
- `/` - Landing page
- `/plans` - Pricing page
- `/docs` - Documentation
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Password reset

## Testing

### Test Development Mode (Default)
1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit any protected route:
   ```
   http://localhost:5173/dashboard
   ```

3. Should see: ✅ Dashboard (no login required)
4. Console shows: `🔓 Development Mode: Authentication bypassed`

### Test with Auth Enforced in Dev
1. Update `.env.development`:
   ```env
   VITE_BYPASS_AUTH_IN_DEV=false
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Visit `/dashboard` → Should redirect to `/login`

4. Set auth token in console:
   ```javascript
   localStorage.setItem('authToken', 'test123');
   ```

5. Visit `/dashboard` → Should work now

### Test Production Mode
1. Build for production:
   ```bash
   npm run build
   ```

2. Preview production build:
   ```bash
   npm run preview
   ```

3. Visit `/dashboard` → Should redirect to `/login` (auth required)

4. Set auth token:
   ```javascript
   localStorage.setItem('authToken', 'your_jwt_token');
   ```

5. Visit `/dashboard` → Should work now

## Security Levels

### Development (Relaxed)
```env
VITE_BYPASS_AUTH_IN_DEV=true    # No login needed
VITE_ENABLE_MOCK_DATA=true      # Use fake data
VITE_DEBUG=true                 # Show debug logs
```

### Production (Strict)
```env
VITE_BYPASS_AUTH_IN_DEV=false   # Must login
VITE_ENABLE_MOCK_DATA=false     # Use real API
VITE_DEBUG=false                # Hide debug logs
```

## Implementation Details

### ProtectedRoute Component
**File**: `src/components/ProtectedRoute.jsx`

```javascript
const isAuthenticated = () => {
  // Development: bypass auth
  if (shouldBypassAuth()) {
    return true;
  }
  
  // Production: check token
  const token = localStorage.getItem('authToken');
  return !!token;
};
```

### App Routing
**File**: `src/App.jsx`

```javascript
// Protected routes
<Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  {/* ... more protected routes */}
</Route>
```

## Real Authentication Integration

To integrate with real backend:

### 1. Login Flow
```javascript
// In Login.jsx
const handleLogin = async (email, password) => {
  const response = await fetch(`${ENV.API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  const { token } = await response.json();
  localStorage.setItem('authToken', token);
  navigate('/dashboard');
};
```

### 2. Logout Flow
```javascript
// In Navbar/Settings
const handleLogout = () => {
  localStorage.removeItem('authToken');
  navigate('/login');
};
```

### 3. Token Validation
```javascript
// Update ProtectedRoute.jsx
const isAuthenticated = () => {
  if (shouldBypassAuth()) return true;
  
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  // Validate token with backend
  // Check expiration, etc.
  return validateToken(token);
};
```

## Best Practices

### DO ✅
- Use `.env.development` for local development
- Use `.env.production` for production builds
- Keep sensitive keys in environment variables
- Never commit `.env` files to git
- Set `BYPASS_AUTH=false` in production

### DON'T ❌
- Don't hardcode API keys in code
- Don't commit production credentials
- Don't use development mode in production
- Don't store tokens in regular variables (use localStorage/cookies)

## Troubleshooting

### Issue: Still redirecting in dev mode
**Solution**: 
1. Check `.env.development` has `VITE_BYPASS_AUTH_IN_DEV=true`
2. Restart dev server (env changes need restart)
3. Clear browser cache

### Issue: Not redirecting in production
**Solution**:
1. Check `.env.production` has `VITE_BYPASS_AUTH_IN_DEV=false`
2. Rebuild: `npm run build`
3. Check console for auth logs

### Issue: Environment variable not working
**Solution**:
1. Ensure variable starts with `VITE_`
2. Restart dev server after changing .env
3. Check import: `import ENV from './config/env'`

## Commands

```bash
# Development (no auth required)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Test with auth enforced in dev
# 1. Set VITE_BYPASS_AUTH_IN_DEV=false in .env.development
# 2. Restart: npm run dev
```

## File Structure

```
frontend/
├── .env.development        ✅ Dev config
├── .env.production        ✅ Prod config
├── .env.example           ✅ Template
├── src/
│   ├── config/
│   │   └── env.js         ✅ Environment config
│   ├── components/
│   │   └── ProtectedRoute.jsx  ✅ Auth guard
│   └── App.jsx            ✅ Routing
```

---

**Status**: ✅ Environment-based authentication fully configured
**Development**: No login required - Access all pages freely
**Production**: Full authentication enforced - Production-level security
