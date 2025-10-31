# 🔐 Environment-Based Security - Quick Guide

## Current Setup

✅ **Development Mode (Current)**
- 🔓 Authentication **BYPASSED**
- Access all pages without login
- Green badge: "DEV MODE - Auth Disabled"
- Perfect for testing

✅ **Production Mode**
- 🔒 Authentication **REQUIRED**
- Must login to access dashboard
- Production-level security enforced

---

## Quick Start

### 1. Development (No Login Needed)
```bash
npm run dev
```
✅ Visit `/dashboard` - Works without login!

### 2. Test Auth in Development
```bash
# Edit .env.development:
VITE_BYPASS_AUTH_IN_DEV=false

# Restart:
npm run dev
```
🔒 Now `/dashboard` requires login

### 3. Production Build
```bash
npm run build
npm run preview
```
🔒 Full authentication enforced

---

## Environment Files

📁 **`.env.development`** (Current - Dev mode)
```env
VITE_BYPASS_AUTH_IN_DEV=true   # ← No login needed
VITE_API_URL=http://localhost:3000/api
```

📁 **`.env.production`** (For production)
```env
VITE_BYPASS_AUTH_IN_DEV=false  # ← Must login
VITE_API_URL=https://api.hypz.io/api
```

---

## Routes

### 🌐 Public (Always Accessible)
- `/` - Landing
- `/plans` - Pricing
- `/docs` - Documentation
- `/login`, `/register`

### 🔒 Protected (Login Required in Production)
- `/dashboard`
- `/buckets`
- `/billing`
- `/usage`
- `/api-keys`
- `/team`
- `/settings`
- `/admin`

---

## Visual Indicators

**Green Badge** (Bottom-left corner)
```
🔓 DEV MODE - Auth Disabled
```
= Can access all pages without login

**Yellow Badge**
```
🛡️ DEV MODE - Auth Enabled
```
= Must login even in dev mode

**No Badge**
= Production mode (auth always required)

---

## Test Authentication

### In Browser Console:
```javascript
// Set auth token
localStorage.setItem('authToken', 'test123');

// Remove auth token
localStorage.removeItem('authToken');

// Check current token
localStorage.getItem('authToken');
```

---

## Configuration

**File**: `src/config/env.js`

```javascript
import { shouldBypassAuth } from '../config/env';

if (shouldBypassAuth()) {
  // Development - no auth needed
} else {
  // Production - auth required
}
```

---

## Need Help?

📖 Full Documentation: `ENVIRONMENT_AUTH_GUIDE.md`

🔧 Implementation: `src/components/ProtectedRoute.jsx`

⚙️ Config: `src/config/env.js`

---

**Remember**: 
- Development = 🔓 Open access
- Production = 🔒 Secure access
- Change mode via `.env` files
