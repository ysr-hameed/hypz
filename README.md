# Hypz - Secure Cloud Storage Platform

A full-stack cloud storage platform with advanced authentication, payment integration, and admin management.

## 🚀 Features

### Authentication & Security
- ✅ Email/Password authentication
- ✅ OAuth (Google, GitHub)
- ✅ Email verification
- ✅ Password reset
- ✅ Two-Factor Authentication (TOTP)
- ✅ Session management
- ✅ JWT-based authorization
- ✅ Rate limiting & security headers

### Payment & Subscriptions
- ✅ Razorpay integration (INR)
- ✅ Multiple plans: Free, Pay-as-you-go, Custom
- ✅ Subscription management
- ✅ Payment history
- ✅ Transaction tracking

### User Features
- ✅ User dashboard with analytics
- ✅ Profile management
- ✅ Security settings
- ✅ Active session tracking
- ✅ Plan upgrades

### Admin Panel
- ✅ Secure admin access at `/admin-ysr`
- ✅ User management
- ✅ Revenue analytics
- ✅ Plan distribution stats
- ✅ Transaction monitoring
- ✅ Activity logs

### Technical Highlights
- ⚡ **Ultra-fast APIs** - Fastify backend
- 🔒 **Bank-level security** - Bcrypt, JWT, 2FA
- 📱 **Fully responsive** - Mobile-first design
- 🎨 **Modern UI** - Tailwind CSS + Framer Motion
- 🗃️ **PostgreSQL** - Robust database with proper indexing
- 📧 **Email service** - Nodemailer integration
- 🚀 **Production-ready** - Error handling, logging, validation

## 📁 Project Structure

```
hypz/
├── backend/                 # Fastify backend
│   ├── config/             # Database & migrations
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & error handling
│   ├── utils/              # Utilities
│   ├── server.js           # Main server file
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── utils/          # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL
- **Authentication**: JWT, OAuth 2.0, Bcrypt
- **Payment**: Razorpay
- **Email**: Nodemailer
- **2FA**: Speakeasy + QRCode

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP**: Axios
- **Build**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd hypz

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb your_database_name

# Or using psql
psql -U postgres
CREATE DATABASE your_database_name;
\q
```

### 3. Configure Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Admin
ADMIN_PASSWORD=your-secure-admin-password
```

### 4. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 5. Configure Frontend

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit if needed (defaults to localhost:5000)
```

### 6. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000/admin-ysr

## 📧 Email Setup (Gmail)

1. Enable 2FA on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Create a new app password
   - Use this password in `EMAIL_PASS`

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create New OAuth App
3. Set callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Secret to `.env`

## 💳 Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get API Keys from Dashboard
3. For testing, use Test Mode keys
4. Add keys to `.env`

## 🗄️ Database Schema

The application includes the following tables:
- **users** - User accounts and authentication
- **plans** - Subscription plans
- **subscriptions** - User subscriptions
- **sessions** - Active user sessions
- **transactions** - Payment transactions
- **admin_logs** - Admin activity logs

See `backend/config/migrate.js` for complete schema.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-2fa` - Verify 2FA
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### OAuth
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### User
- `PUT /api/user/profile` - Update profile
- `POST /api/user/2fa/setup` - Setup 2FA
- `POST /api/user/2fa/enable` - Enable 2FA
- `POST /api/user/2fa/disable` - Disable 2FA
- `GET /api/user/sessions` - Get sessions
- `DELETE /api/user/sessions/:id` - Revoke session

### Payment
- `GET /api/payment/plans` - Get plans
- `POST /api/payment/create-order` - Create order
- `POST /api/payment/verify-payment` - Verify payment
- `GET /api/payment/subscription` - Get subscription
- `GET /api/payment/history` - Payment history

### Admin (Requires X-Admin-Password header)
- `GET /api/admin-ysr/stats` - Dashboard stats
- `GET /api/admin-ysr/users` - List users
- `GET /api/admin-ysr/users/:id` - User details
- `PUT /api/admin-ysr/users/:id/plan` - Update plan
- `DELETE /api/admin-ysr/users/:id` - Delete user
- `GET /api/admin-ysr/logs` - Activity logs

## 🚀 Production Deployment

### Backend

1. Set environment to production:
```env
NODE_ENV=production
```

2. Use a process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name hypz-backend
```

3. Set up SSL/TLS (Let's Encrypt)
4. Configure reverse proxy (Nginx)
5. Set strong secrets and passwords
6. Enable database backups

### Frontend

1. Build for production:
```bash
npm run build
```

2. Serve with a static server:
```bash
npm install -g serve
serve -s dist -p 3000
```

Or deploy to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** in production
4. **Set strong admin password**
5. **Regular database backups**
6. **Keep dependencies updated**
7. **Use rate limiting** (already implemented)
8. **Monitor logs** for suspicious activity

## 🧪 Testing

```bash
# Backend
cd backend
# Add your tests here

# Frontend  
cd frontend
# Add your tests here
```

## 📝 License

MIT

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📞 Support

For support, email support@hypz.com or open an issue.

---

**Note**: This is a production-ready template. Make sure to:
1. Update all secret keys
2. Configure your actual database URL
3. Set up proper OAuth apps
4. Configure email service
5. Set up Razorpay account
6. Change admin password
7. Update this README with your actual repo URL

**Happy coding! 🚀**
