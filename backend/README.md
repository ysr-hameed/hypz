# Hypz Backend

High-performance authentication and payment backend built with Fastify, PostgreSQL, and Razorpay.

## Features

- ⚡ **Ultra-fast API** - Built with Fastify for maximum performance
- 🔐 **Secure Authentication** - JWT-based with email/password and OAuth (Google, GitHub)
- 📧 **Email Verification** - Automated email verification system
- 🔑 **Password Reset** - Secure password reset functionality
- 🛡️ **2FA Support** - Authenticator app integration with QR code
- 💳 **Razorpay Integration** - Payment processing in INR
- 📊 **Admin Panel** - Comprehensive admin dashboard with analytics
- 🗃️ **PostgreSQL** - Robust database with proper indexing
- 🚀 **Async/Await** - Full async support for better performance
- 🔒 **Security** - Rate limiting, helmet, CORS, and more

## Tech Stack

- **Framework**: Fastify 4.x
- **Database**: PostgreSQL
- **Authentication**: JWT, OAuth 2.0
- **Payment**: Razorpay
- **Email**: Nodemailer
- **2FA**: Speakeasy + QRCode

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - Database URL
   - JWT Secret
   - Email credentials
   - OAuth credentials (Google, GitHub)
   - Razorpay keys
   - Admin password

4. Run database migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `ADMIN_PASSWORD` | Admin panel password |

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register with email/password
- `POST /login` - Login with email/password
- `POST /verify-2fa` - Verify 2FA code
- `GET /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout (protected)

### OAuth (`/api/auth`)

- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback
- `GET /github` - Initiate GitHub OAuth
- `GET /github/callback` - GitHub OAuth callback

### User (`/api/user`)

- `PUT /profile` - Update profile (protected)
- `POST /2fa/setup` - Setup 2FA (protected)
- `POST /2fa/enable` - Enable 2FA (protected)
- `POST /2fa/disable` - Disable 2FA (protected)
- `GET /sessions` - Get active sessions (protected)
- `DELETE /sessions/:sessionId` - Revoke session (protected)

### Payment (`/api/payment`)

- `GET /plans` - Get all plans
- `POST /create-order` - Create Razorpay order (protected)
- `POST /verify-payment` - Verify payment (protected)
- `GET /subscription` - Get user subscription (protected)
- `GET /history` - Get payment history (protected)

### Admin (`/api/admin-ysr`)

All admin routes require `X-Admin-Password` header.

- `GET /stats` - Get dashboard statistics
- `GET /users` - Get all users (paginated)
- `GET /users/:userId` - Get user details
- `PUT /users/:userId/plan` - Update user plan
- `PUT /users/:userId/status` - Toggle user status
- `DELETE /users/:userId` - Delete user
- `GET /logs` - Get admin activity logs

## Database Schema

### Tables

- **users** - User accounts with auth data
- **plans** - Subscription plans
- **subscriptions** - User subscriptions
- **sessions** - Active user sessions
- **transactions** - Payment transactions
- **admin_logs** - Admin activity logs

## Security Features

1. **Password Hashing** - Bcrypt with 12 rounds
2. **JWT Tokens** - Secure token-based authentication
3. **Rate Limiting** - 100 requests per 15 minutes
4. **Helmet** - Security headers
5. **CORS** - Configured for frontend origin
6. **2FA** - TOTP-based two-factor authentication
7. **Session Management** - Track and revoke sessions
8. **Admin Protection** - Password-protected admin routes

## Payment Integration

### Razorpay Setup

1. Get API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Add keys to `.env`
3. Test with Razorpay test mode

### Plans

- **Free** - ₹0/month - 1GB storage, community support
- **Pay As You Go** - Variable pricing based on usage
- **Custom** - Enterprise solution with custom requirements

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Add credentials to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Add callback URL: `http://localhost:5000/api/auth/github/callback`
4. Add credentials to `.env`

## Email Configuration

### Gmail SMTP

1. Enable 2FA on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `.env`

## Admin Panel Access

Access the admin panel at `/admin-ysr` route. Include the `X-Admin-Password` header with your admin password for all requests.

Example:
```bash
curl -H "X-Admin-Password: your-admin-password" http://localhost:5000/api/admin-ysr/stats
```

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd)
3. Set up SSL/TLS (Let's Encrypt)
4. Configure PostgreSQL for production
5. Set strong secrets and passwords
6. Enable database backups

## License

MIT
