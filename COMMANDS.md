# Development Commands Cheat Sheet

## Initial Setup

```bash
# Run automated setup
./setup.sh

# Or manual setup
cd backend && npm install
cd frontend && npm install
```

## Database

```bash
# Run migrations
cd backend
npm run migrate

# Connect to database
psql -d your_database_name

# Drop and recreate (if needed)
dropdb your_database_name
createdb your_database_name
npm run migrate
```

## Development

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev

# Start both with one command (if using concurrently)
npm run dev  # from root
```

## Production Build

```bash
# Backend
cd backend
npm start

# With PM2
pm2 start server.js --name hypz-backend

# Frontend
cd frontend
npm run build
npm run preview  # test production build
```

## Testing

```bash
# Test API endpoints
curl http://localhost:5000/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/me
```

## Database Queries

```sql
-- Check users
SELECT * FROM users LIMIT 10;

-- Check plans
SELECT * FROM plans;

-- Check subscriptions
SELECT u.email, p.name, s.status 
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id;

-- Check transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- Check sessions
SELECT u.email, s.ip_address, s.created_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW();
```

## Environment Variables

### Required for Backend
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db_name
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

### Optional (for full functionality)
```bash
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-secret
```

## Common Issues

### Port in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Clear all sessions
```sql
DELETE FROM sessions;
```

### Reset user password
```sql
UPDATE users SET password = '$2b$12$NEW_HASH_HERE' WHERE email = 'user@example.com';
```

## Git Commands

```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: Full-stack auth platform"

# Push to remote
git remote add origin your-repo-url
git push -u origin main

# Create .gitignore (already created)
# Ensure .env files are not tracked
```

## Deployment

### Backend (VPS/Server)
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js --name hypz-backend

# Monitor
pm2 monit

# Logs
pm2 logs hypz-backend

# Restart
pm2 restart hypz-backend
```

### Frontend (Static Hosting)
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name
```

## Monitoring

```bash
# Backend logs
pm2 logs

# Database size
psql -d your_db -c "SELECT pg_size_pretty(pg_database_size('your_db'));"

# Active connections
psql -d your_db -c "SELECT count(*) FROM pg_stat_activity;"
```

## Backup & Restore

```bash
# Backup database
pg_dump your_database_name > backup.sql

# Restore database
psql your_database_name < backup.sql

# Backup with date
pg_dump your_database_name > backup_$(date +%Y%m%d).sql
```

## API Testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Admin stats
curl http://localhost:5000/api/admin-ysr/stats \
  -H "X-Admin-Password: your-admin-password"
```

## Quick Fixes

### Clear browser cache
```
Ctrl + Shift + R (Chrome/Firefox)
Cmd + Shift + R (Mac)
```

### Reset everything
```bash
# Drop database
dropdb your_database_name

# Recreate
createdb your_database_name

# Run migrations
cd backend && npm run migrate

# Clear node_modules
rm -rf backend/node_modules frontend/node_modules
npm install # in both directories
```

### Update dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

## Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test endpoint
ab -n 1000 -c 10 http://localhost:5000/health

# Load test with authentication
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/me
```

## Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check dependencies
npx depcheck
```

---

**Keep this file handy for quick reference during development!**
