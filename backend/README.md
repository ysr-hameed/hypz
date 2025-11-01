# 🚀 Hypz Storage Backend API

Ultra-fast, secure, and scalable backend API for Hypz Storage Platform built with Node.js, Express, and PostgreSQL.

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens, email verification, and password reset
- 🗄️ **PostgreSQL Database**: High-performance database with connection pooling
- 📦 **Bucket Management**: Create, manage, and organize storage buckets
- 📁 **File Operations**: Upload, download, delete files with metadata support
- 🔑 **API Key Management**: Generate and manage API keys for programmatic access
- 📊 **Usage Tracking**: Monitor storage, bandwidth, and API usage
- 🛡️ **Security**: Rate limiting, CORS, Helmet, XSS protection, SQL injection prevention
- 📧 **Email Notifications**: Verification emails, password reset, and welcome emails
- ⚡ **Performance**: Compression, caching, and optimized queries
- 📝 **Activity Logging**: Track all user actions
- 🔄 **Transaction Support**: ACID-compliant database operations

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a PostgreSQL database:

```bash
createdb hypz_db
```

Or using psql:

```sql
CREATE DATABASE hypz_db;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Important**: Update these variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_REFRESH_SECRET`: Generate with `openssl rand -base64 32`
- `EMAIL_*`: Your SMTP credentials

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables:
- users
- buckets
- files
- api_keys
- usage_records
- payments
- team_members
- activity_logs
- refresh_tokens

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js          # Configuration management
│   │   └── database.js        # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── bucketController.js # Bucket operations
│   │   ├── fileController.js   # File operations
│   │   ├── apiKeyController.js # API key management
│   │   └── usageController.js  # Usage tracking
│   ├── middleware/
│   │   ├── auth.js            # Auth middleware
│   │   ├── security.js        # Security middleware
│   │   └── validator.js       # Input validation
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── bucketRoutes.js    # Bucket endpoints
│   │   ├── fileRoutes.js      # File endpoints
│   │   ├── apiKeyRoutes.js    # API key endpoints
│   │   └── usageRoutes.js     # Usage endpoints
│   ├── utils/
│   │   ├── helpers.js         # Helper functions
│   │   └── email.js           # Email service
│   ├── database/
│   │   └── migrate.js         # Database migration
│   └── server.js              # Main server file
├── uploads/                    # File storage directory
├── .env                       # Environment variables
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `GET /me` - Get current user
- `POST /logout` - Logout user

### Buckets (`/api/v1/buckets`)

- `POST /` - Create bucket
- `GET /` - Get all buckets
- `GET /:bucketId` - Get bucket details
- `PUT /:bucketId` - Update bucket
- `DELETE /:bucketId` - Delete bucket
- `GET /:bucketId/stats` - Get bucket statistics

### Files (`/api/v1/files`)

- `POST /:bucketId/upload` - Upload file
- `GET /:bucketId/files` - Get files in bucket
- `GET /file/:fileId` - Get file details
- `GET /file/:fileId/download` - Download file
- `DELETE /file/:fileId` - Delete file
- `PATCH /file/:fileId` - Update file metadata

### API Keys (`/api/v1/api-keys`)

- `POST /` - Create API key
- `GET /` - Get all API keys
- `GET /:keyId` - Get API key details
- `PUT /:keyId` - Update API key
- `DELETE /:keyId` - Delete API key
- `POST /:keyId/regenerate` - Regenerate API key

### Usage (`/api/v1/usage`)

- `GET /current` - Get current usage
- `GET /history` - Get usage history
- `GET /analytics` - Get usage analytics

## 🔐 Authentication

### JWT Token

Include in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### API Key

Include in header or query:

```
X-API-Key: <your-api-key>
```

or

```
?api_key=<your-api-key>
```

## 📊 Database Schema

### Users Table
- Authentication and profile information
- Email verification status
- Plan and role management

### Buckets Table
- Storage container management
- Visibility and CORS settings
- Custom domain support

### Files Table
- File metadata and storage paths
- Download tracking
- Soft delete support

### API Keys Table
- API key management
- Permission control
- Usage tracking

### Usage Records Table
- Daily usage tracking
- Storage and bandwidth monitoring
- API call counting

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Cross-Origin Resource Sharing configuration
- **Helmet**: Security headers
- **XSS Protection**: Cross-site scripting prevention
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: express-validator
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **API Key Hashing**: Secure API key storage

## 📧 Email Templates

Beautiful HTML email templates for:
- Email verification
- Password reset
- Welcome message

Configure SMTP settings in `.env` file.

## 🔧 Configuration

All configuration is managed through environment variables:

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `EMAIL_*`: SMTP configuration
- `UPLOAD_DIR`: File upload directory
- `MAX_FILE_SIZE`: Maximum file size in bytes

## 🚀 Deployment

### Production Build

```bash
NODE_ENV=production npm start
```

### Environment Variables

Make sure to set all required environment variables in production:

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export JWT_SECRET="your-production-secret"
export NODE_ENV="production"
```

### Database Migration

Run migrations on production:

```bash
npm run migrate
```

## 📝 Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Upload File

```bash
curl -X POST http://localhost:5000/api/v1/files/{bucketId}/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.jpg"
```

### Create API Key

```bash
curl -X POST http://localhost:5000/api/v1/api-keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": {"read": true, "write": true, "delete": false}
  }'
```

## 🐛 Troubleshooting

### Database Connection Issues

Check your `DATABASE_URL` format:

```
postgresql://username:password@localhost:5432/hypz_db
```

### Email Not Sending

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASSWORD`

### File Upload Errors

Ensure `uploads/` directory has write permissions:

```bash
chmod -R 755 uploads/
```

## 📄 License

MIT License

## 🤝 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for Hypz Storage Platform**
