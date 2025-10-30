# Hypz Storage - Setup Instructions

## 🚀 Quick Setup Guide

Follow these steps to get your Hypz Storage SaaS application running locally.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** and npm installed
- ✅ **PostgreSQL 14+** installed and running
- ✅ **Backblaze B2 Account** (sign up at https://www.backblaze.com/b2)
- ✅ **Razorpay Account** (sign up at https://razorpay.com)
- ✅ Git installed

## Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd hypz
```

## Step 2: Setup PostgreSQL Database

### Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hypz;

# Create user (optional but recommended)
CREATE USER hypz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hypz TO hypz_user;

# Exit
\q
```

### Get Database URL

Your database URL format:
```
postgresql://username:password@localhost:5432/hypz
```

For example:
```
postgresql://hypz_user:your_password@localhost:5432/hypz
```

## Step 3: Setup Backblaze B2

1. **Create B2 Account**: Go to https://www.backblaze.com/b2/sign-up.html
2. **Create a Bucket**:
   - Name: `hypz-storage` (or any name)
   - Files: Private
   - Encryption: Server-Side Encryption (optional)
3. **Generate Application Key**:
   - Go to App Keys
   - Click "Add a New Application Key"
   - Name: `hypz-app`
   - Allow access to: Your bucket
   - Copy the **keyID** and **applicationKey** (you won't see it again!)
4. **Note your endpoint**:
   - Usually: `https://s3.us-west-002.backblazeb2.com`
   - Check your bucket's endpoint in the B2 dashboard

## Step 4: Setup Razorpay

1. **Create Razorpay Account**: Go to https://dashboard.razorpay.com/signup
2. **Get API Keys**:
   - Go to Settings → API Keys
   - Generate keys for Test Mode
   - Copy **Key ID** and **Key Secret**
3. **Setup Webhook** (optional, for production):
   - Settings → Webhooks
   - Add: `https://your-domain.com/api/billing/webhook`

## Step 5: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

### Configure `.env`:

```env
# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database - IMPORTANT: Use your actual database URL
DATABASE_URL=postgresql://hypz_user:your_password@localhost:5432/hypz

# JWT - IMPORTANT: Change these to random secure strings
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-also-32-characters-or-more
JWT_REFRESH_EXPIRES_IN=30d

# Backblaze B2 - IMPORTANT: Use your actual B2 credentials
B2_KEY_ID=your-actual-b2-key-id
B2_APPLICATION_KEY=your-actual-b2-application-key
B2_BUCKET_NAME=hypz-storage
B2_BUCKET_ID=your-bucket-id
B2_REGION=us-west-002
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com

# File Storage Limits (in bytes)
MAX_FILE_SIZE=104857600
FREE_PLAN_STORAGE=1073741824
PRO_PLAN_STORAGE=107374182400
ENTERPRISE_PLAN_STORAGE=1099511627776

# Razorpay - IMPORTANT: Use your actual Razorpay keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# File Cleanup
FILE_RETENTION_DAYS=90
TEMP_FILE_CLEANUP_HOURS=24
```

### Start Backend:

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The backend will:
- Start on http://localhost:5000
- Automatically create database tables
- Be ready to accept requests

### Verify Backend:

```bash
curl http://localhost:5000/health
# Should return: {"success":true,"message":"Server is running",...}
```

## Step 6: Dashboard Setup

Open a **new terminal window**:

```bash
cd dashboard

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

### Configure `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

### Start Dashboard:

```bash
# Development mode
npm run dev

# Or build and start production
npm run build
npm start
```

Dashboard will be available at http://localhost:3000

## Step 7: Create Your First Account

1. Open http://localhost:3000 in your browser
2. Click "Get Started Free" or "Sign Up"
3. Fill in your details:
   - Full Name
   - Email
   - Password (min 8 characters)
4. Click "Create Account"
5. You'll be redirected to the dashboard
6. **Important**: Copy your API key from the dashboard!

## Step 8: Test File Upload

### Via Dashboard:
1. Go to "Files" page
2. Click "Upload File"
3. Select a file
4. Wait for upload to complete

### Via SDK:

```bash
# In a new directory
npm install @hypz/storage-sdk

# Create test.js
```

```javascript
const Hypz = require('@hypz/storage-sdk');

const client = new Hypz.Client('your-api-key-from-dashboard', {
  baseURL: 'http://localhost:5000/api'
});

async function test() {
  try {
    // List files
    const files = await client.files.list();
    console.log('Files:', files);

    // Get usage
    const usage = await client.usage.getCurrent();
    console.log('Usage:', usage);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

```bash
node test.js
```

## Step 9: Optional - Setup SDK for Development

```bash
cd sdk

# Install dependencies
npm install

# Link for local development
npm link

# Now you can use it in any project
npm link @hypz/storage-sdk
```

## Troubleshooting

### Backend won't start

**Error: "Database connection failed"**
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify DATABASE_URL is correct
- Test connection: `psql "postgresql://..."`

**Error: "Port 5000 already in use"**
- Change PORT in backend/.env
- Or kill the process: `lsof -ti:5000 | xargs kill`

### Dashboard won't start

**Error: "Port 3000 already in use"**
- Kill the process: `lsof -ti:3000 | xargs kill`
- Or change port: `npm run dev -- -p 3001`

**Error: "Cannot connect to API"**
- Verify backend is running
- Check NEXT_PUBLIC_API_URL in .env.local

### File upload fails

**"Storage quota exceeded"**
- You're on Free plan (1GB limit)
- Delete some files or upgrade plan

**"Failed to upload to storage"**
- Check Backblaze credentials in backend/.env
- Verify bucket exists and is accessible
- Check bucket permissions

**"File size exceeds limit"**
- Free plan: max 50MB per file
- Reduce file size or upgrade plan

### Database issues

**"relation users does not exist"**
- Tables weren't created
- Restart backend - it creates tables on startup

**Reset database:**
```bash
psql -U postgres
DROP DATABASE hypz;
CREATE DATABASE hypz;
\q

# Restart backend to recreate tables
```

### Authentication issues

**"Invalid API key"**
- Copy the correct API key from dashboard
- Remove any extra spaces
- Regenerate key if needed

**"Token expired"**
- Login again to get new token
- Tokens expire after 7 days by default

## Production Deployment

### Backend (Recommended: Railway, Render, DigitalOcean)

1. **Create production database** (Supabase, Railway, etc.)
2. **Update environment variables**:
   - Set NODE_ENV=production
   - Use production database URL
   - Use production Razorpay keys (live mode)
   - Change JWT secrets
3. **Deploy**:
   ```bash
   cd backend
   npm install --production
   npm start
   ```

### Frontend (Recommended: Vercel, Netlify)

1. **Update environment**:
   - NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   - NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxx
2. **Deploy**:
   ```bash
   cd dashboard
   npm run build
   npm start
   ```

### Security Checklist

- [ ] Change all default secrets
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Set proper CORS_ORIGIN
- [ ] Use production Razorpay keys
- [ ] Regular database backups
- [ ] Monitor logs
- [ ] Set up error alerts

## Next Steps

✅ Explore the dashboard
✅ Read [API Documentation](docs/api.md)
✅ Try the SDK examples
✅ Set up monitoring
✅ Configure backups
✅ Customize branding
✅ Add custom domain

## Need Help?

- 📖 Documentation: `docs/` folder
- 📧 Create GitHub issue
- 💬 Check README.md

---

**Congratulations! Your Hypz Storage SaaS is ready! 🎉**
