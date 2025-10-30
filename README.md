# Hypz Storage

**S3-Compatible Object Storage SaaS for India** 🇮🇳

A modern, production-ready cloud storage platform built with Node.js, Next.js, PostgreSQL, and Backblaze B2. Designed specifically for the Indian market with affordable pricing, local payment options (Razorpay), and optimized infrastructure.

## 🚀 Features

- **S3-Compatible API**: Works with all S3-compatible tools and libraries
- **Backblaze B2 Integration**: Cost-effective storage solution
- **Modern Dashboard**: Beautiful, responsive UI with dark mode support
- **Multi-tier Plans**: Free, Pro, and Enterprise plans for every need
- **Usage Tracking**: Real-time monitoring of storage, bandwidth, and API calls
- **Razorpay Integration**: Accept payments in INR with UPI, cards, and wallets
- **RESTful API**: Clean, well-documented API endpoints
- **JavaScript SDK**: Easy-to-use SDK for Node.js applications
- **Authentication**: JWT-based auth with API key support
- **File Management**: Upload, download, delete with expiration support
- **Background Jobs**: Automated cleanup and usage reset
- **Rate Limiting**: Built-in protection against abuse
- **PostgreSQL Database**: Reliable and scalable data storage

## 📁 Project Structure

```
hypz/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Auth, validation, rate limiting
│   │   ├── models/   # Database models
│   │   ├── routes/   # API routes
│   │   ├── jobs/     # Background jobs
│   │   └── utils/    # Helper functions
│   └── package.json
├── dashboard/        # Next.js frontend
│   ├── pages/       # Next.js pages
│   ├── components/  # React components
│   ├── lib/         # API client, auth helpers
│   └── styles/      # Global styles
├── sdk/             # JavaScript SDK
│   ├── index.js     # SDK implementation
│   └── README.md
└── docs/            # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - API server
- **PostgreSQL** - Primary database
- **Backblaze B2** - Object storage (S3-compatible)
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment processing
- **Winston** - Logging
- **Joi** - Validation
- **Node-cron** - Scheduled jobs

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Next Themes** - Theme management

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Backblaze B2 account
- Razorpay account (for payments)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hypz.git
cd hypz
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hypz
JWT_SECRET=your-secret-key
B2_KEY_ID=your-backblaze-key-id
B2_APPLICATION_KEY=your-backblaze-app-key
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**Start the backend:**

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Setup Database

The database schema will be automatically created when you start the backend for the first time. Tables include:
- `users` - User accounts
- `files` - File metadata
- `usage` - Usage tracking
- `billing` - Payment records

### 4. Setup Dashboard

```bash
cd dashboard
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit with your API URL
nano .env.local
```

**Start the dashboard:**

```bash
npm run dev
# Dashboard runs on http://localhost:3000
```

### 5. Install SDK (Optional)

```bash
cd sdk
npm install
npm link  # For local development
```

## 📖 API Documentation

### Authentication

All API requests require authentication via:
- **API Key**: `X-API-Key: your-api-key`
- **JWT Token**: `Authorization: Bearer your-token`

### Endpoints

#### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/regenerate-api-key` - Regenerate API key

#### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List files
- `GET /api/files/:id` - Get file info
- `GET /api/files/:id/download` - Get download URL
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/stats/summary` - Get file stats

#### Billing
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/create-order` - Create payment order
- `POST /api/billing/verify-payment` - Verify payment
- `GET /api/billing/history` - Get billing history
- `GET /api/billing/stats` - Get billing stats

#### Usage
- `GET /api/usage/current` - Get current usage
- `GET /api/usage/history` - Get usage history

## 💻 SDK Usage

```javascript
const Hypz = require('@hypz/storage-sdk');

const client = new Hypz.Client('your-api-key');

// Upload a file
const file = await client.files.upload({
  file: './image.jpg',
  filename: 'my-image.jpg',
  isPublic: false
});

// Get download URL
const url = await client.files.getDownloadUrl(file.id);

// List files
const files = await client.files.list({ limit: 10 });

// Delete file
await client.files.delete(file.id);
```

## 💰 Pricing Plans

| Plan | Price | Storage | Bandwidth | Max File Size | API Calls |
|------|-------|---------|-----------|---------------|-----------|
| **Free** | ₹0/month | 1 GB | 5 GB | 50 MB | 1,000 |
| **Pro** | ₹499/month | 100 GB | 500 GB | 500 MB | 50,000 |
| **Enterprise** | ₹2,999/month | 1 TB | 5 TB | 5 GB | 500,000 |

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- API key authentication
- Rate limiting (100 req/15min)
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- SQL injection protection
- XSS protection

## 🎨 Dashboard Features

- **Dark Mode Support** - Beautiful light/dark themes
- **Responsive Design** - Works on all devices
- **Real-time Charts** - Usage visualization with Recharts
- **File Management** - Upload, download, delete files
- **Usage Monitoring** - Track storage, bandwidth, API calls
- **Billing Dashboard** - Manage subscriptions and payments
- **API Documentation** - Built-in docs viewer

## 🔄 Background Jobs

- **Daily Usage Reset**: Resets usage counters monthly
- **File Cleanup**: Removes expired files automatically
- **Health Check**: Monitors system health every 5 minutes

## 🚀 Deployment

### Backend (Node.js)

**Recommended:** Railway, Render, or DigitalOcean

```bash
# Build
cd backend
npm install --production

# Start
npm start
```

### Frontend (Next.js)

**Recommended:** Vercel, Netlify

```bash
cd dashboard
npm run build
npm start
```

### Database

Use managed PostgreSQL services:
- Supabase (free tier available)
- Railway
- DigitalOcean Managed Databases
- AWS RDS

### Storage

Configure Backblaze B2:
1. Create B2 account
2. Create a bucket
3. Generate application key
4. Add credentials to `.env`

## 📝 Environment Variables Reference

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=production
PORT=5000
API_BASE_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Backblaze B2
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-app-key
B2_BUCKET_NAME=your-bucket
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Dashboard (`dashboard/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Backblaze B2 for affordable object storage
- Razorpay for seamless Indian payments
- Next.js and React teams for amazing frameworks
- PostgreSQL community for robust database

## 📧 Support

- **Email**: support@hypz.io
- **Documentation**: https://docs.hypz.io
- **Issues**: https://github.com/yourusername/hypz/issues

## 🌟 Star History

If you find this project helpful, please give it a star! ⭐

---

Made with ❤️ for Indian developers
