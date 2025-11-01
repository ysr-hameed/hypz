# 🚀 Hypz Storage Platform

<div align="center">

![Hypz Storage](https://img.shields.io/badge/Hypz-Storage-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Ultra-Fast, Secure Cloud Storage Platform**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api) • [Demo](#-demo)

</div>

---

## 📖 Overview

Hypz Storage is a modern, full-stack cloud storage platform built for developers. Upload, manage, and deliver files globally with our blazing-fast CDN, simple REST API, and beautiful dashboard.

### 🏗️ Tech Stack

**Frontend:**
- ⚛️ React 18 + Vite
- 🎨 TailwindCSS + Custom Design System
- 🎭 Lucide Icons
- 📱 Fully Responsive

**Backend:**
- 🚀 Node.js + Express
- 🗄️ PostgreSQL with Connection Pooling
- 🔐 JWT Authentication
- 🛡️ Enterprise-Grade Security

---

## ✨ Features

### 🔐 Authentication & Security
- Email/Password registration with verification
- JWT-based authentication with refresh tokens
- Password reset functionality
- OAuth support (Google, GitHub)
- Role-based access control
- Rate limiting & DDoS protection
- XSS & SQL injection prevention

### 📦 Storage Management
- **Buckets**: Organize files in containers
- **File Upload**: Support for large files (up to 100MB)
- **File Management**: Upload, download, delete, update metadata
- **Visibility Control**: Public or private files
- **CDN Delivery**: Fast global content delivery
- **Custom Domains**: Use your own domain

### 🔑 API Keys
- Generate unlimited API keys
- Granular permissions (read, write, delete)
- Rate limiting per key
- Expiration dates
- Usage tracking
- Easy regeneration

### 📊 Usage & Analytics
- Real-time storage usage
- Bandwidth monitoring
- API call tracking
- Daily/monthly statistics
- Bucket-wise analytics
- File type distribution
- Download tracking

### 🎯 Dashboard
- Beautiful, modern UI
- Dark mode support
- Real-time statistics
- Activity logs
- Team collaboration (coming soon)
- Billing management (coming soon)

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hypz.git
cd hypz

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev

# Setup frontend (in new terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/v1

### Detailed Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete installation instructions.

---

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete installation guide
- **[API Documentation](./backend/API_DOCS.md)** - Full API reference
- **[Quick Start](./backend/QUICKSTART.md)** - Get started in 5 minutes
- **[Backend README](./backend/README.md)** - Backend documentation
- **[Frontend README](./frontend/README.md)** - Frontend documentation

---

## 🔌 API Endpoints

### Authentication
```bash
POST /api/v1/auth/register      # Register new user
POST /api/v1/auth/login         # Login
POST /api/v1/auth/verify-email  # Verify email
GET  /api/v1/auth/me            # Get current user
```

### Buckets
```bash
POST   /api/v1/buckets          # Create bucket
GET    /api/v1/buckets          # List buckets
GET    /api/v1/buckets/:id      # Get bucket
PUT    /api/v1/buckets/:id      # Update bucket
DELETE /api/v1/buckets/:id      # Delete bucket
```

### Files
```bash
POST   /api/v1/files/:bucketId/upload  # Upload file
GET    /api/v1/files/:bucketId/files   # List files
GET    /api/v1/files/file/:id/download # Download file
DELETE /api/v1/files/file/:id          # Delete file
```

### API Keys
```bash
POST   /api/v1/api-keys         # Create API key
GET    /api/v1/api-keys         # List API keys
DELETE /api/v1/api-keys/:id     # Delete API key
```

### Usage
```bash
GET /api/v1/usage/current       # Get current usage
GET /api/v1/usage/history       # Get usage history
GET /api/v1/usage/analytics     # Get analytics
```

See [API_DOCS.md](./backend/API_DOCS.md) for complete API documentation.

---

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### File Upload
![Upload](https://via.placeholder.com/800x400?text=File+Upload+Screenshot)

### API Keys
![API Keys](https://via.placeholder.com/800x400?text=API+Keys+Screenshot)

---

## 🗺️ Roadmap

- [x] User authentication & authorization
- [x] Bucket management
- [x] File upload/download
- [x] API key management
- [x] Usage tracking & analytics
- [ ] Team collaboration
- [ ] Payment integration (Stripe)
- [ ] CDN integration
- [ ] File versioning
- [ ] Automated backups
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] S3 compatibility layer

---

## 🏗️ Project Structure

```
hypz/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Auth & security
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Helper functions
│   │   └── database/    # DB migrations
│   ├── uploads/         # File storage
│   └── package.json
│
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── config/      # Configuration
│   │   └── App.jsx
│   └── package.json
│
└── SETUP_GUIDE.md      # Installation guide
```

---

## 🛡️ Security

We take security seriously:

- ✅ Password hashing with bcrypt
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting on all endpoints
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Secure file upload
- ✅ API key hashing

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Hypz Storage Team**

- Website: https://hypz.io
- GitHub: [@ysr-hameed](https://github.com/ysr-hameed)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

## 📞 Support

For support, email support@hypz.io or join our Discord server.

---

<div align="center">

**Built with ❤️ by developers, for developers**

[⬆ Back to Top](#-hypz-storage-platform)

</div>
