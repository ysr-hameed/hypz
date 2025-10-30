# Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install Dependencies

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

### 2. Configure Database

**Option A: Using your existing PostgreSQL database**

Edit `backend/.env`:
```env
DATABASE_URL=<your-database-url>
```

**Option B: Quick PostgreSQL setup**

```bash
# Create database
createdb hypz_db

# Update backend/.env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/hypz_db
```

### 3. Minimal Configuration

Edit `backend/.env` with these essentials:

```env
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/hypz_db
JWT_SECRET=generate-a-strong-secret-key-here
ADMIN_PASSWORD=your-admin-password

# Email (optional for testing, use mailtrap.io or similar)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-pass

# OAuth (optional - can skip for testing)
GOOGLE_CLIENT_ID=skip-for-now
GITHUB_CLIENT_ID=skip-for-now

# Razorpay (optional - can test without)
RAZORPAY_KEY_ID=skip-for-now
RAZORPAY_KEY_SECRET=skip-for-now
```

### 4. Run Migrations

```bash
cd backend
npm run migrate
```

### 5. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 6. Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000  
- **Admin**: http://localhost:3000/admin-ysr

## 🧪 Quick Test

1. **Register**: Go to http://localhost:3000/register
2. **Login**: Use your credentials (email verification optional in dev)
3. **Dashboard**: View your dashboard
4. **Admin**: Go to `/admin-ysr` and use your admin password

## 📝 What Works Without Full Setup

### ✅ Works Immediately
- User registration and login
- Dashboard access
- Profile management
- Session management
- Database operations

### ⚠️ Requires Configuration
- **Email features**: Need SMTP setup
  - Email verification
  - Password reset
  
- **OAuth**: Need Google/GitHub apps
  - Google login
  - GitHub login
  
- **2FA**: Works immediately (no external service needed)
  
- **Payments**: Need Razorpay account
  - Plan purchases
  - Payment processing

## 🚀 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ chars)
- [ ] Set secure `ADMIN_PASSWORD`
- [ ] Configure production database
- [ ] Set up HTTPS/SSL
- [ ] Configure email service (SendGrid, AWS SES, etc.)
- [ ] Set up OAuth apps with production URLs
- [ ] Configure Razorpay production keys
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Configure CDN for frontend

## 🐛 Common Issues

### Database Connection Failed
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or on macOS
brew services list
```

### Port Already in Use
```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

### Migration Errors
```bash
# Drop and recreate database
dropdb hypz_db
createdb hypz_db

# Run migrations again
npm run migrate
```

## 📚 Next Steps

1. Read the full [README.md](./README.md)
2. Check [backend/README.md](./backend/README.md) for API docs
3. Check [frontend/README.md](./frontend/README.md) for UI docs
4. Configure OAuth providers
5. Set up email service
6. Configure Razorpay

## 💡 Tips

- Use **Mailtrap** for email testing in development
- Use **Razorpay Test Mode** for payment testing
- Keep your `.env` files secure and never commit them
- The admin panel is at `/admin-ysr` (not easy to guess)
- 2FA QR codes work with Google Authenticator or Authy

## 🎉 You're Ready!

Your Hypz application is now running. Start building amazing features!

Need help? Check the documentation or open an issue.
