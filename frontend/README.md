# Hypz Frontend

Modern, responsive React frontend for Hypz cloud storage platform.

## Features

- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and Framer Motion
- 🔐 **Complete Authentication** - Login, Register, OAuth (Google, GitHub), 2FA
- 📧 **Email Verification** - Secure email verification system
- 🔑 **Password Reset** - Forgot password functionality
- 💳 **Razorpay Integration** - Payment processing in INR
- 📊 **User Dashboard** - Comprehensive user dashboard with analytics
- ⚙️ **Settings** - Profile management, 2FA setup, session management
- 🛡️ **Admin Panel** - Secure admin dashboard at `/admin-ysr`
- 📱 **Responsive** - Mobile-first design, works on all devices
- ⚡ **Fast** - Optimized with Vite for lightning-fast dev and build

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **QR Code**: qrcode.react
- **Charts**: Chart.js + React Chart.js 2
- **Build Tool**: Vite

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   └── Footer.jsx
├── context/            # React Context
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Pricing.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       └── AdminDashboard.jsx
├── utils/              # Utilities
│   └── api.js
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Pages

### Public Pages
- **Landing** (`/`) - Home page with features and pricing
- **Pricing** (`/pricing`) - Detailed pricing information
- **Login** (`/login`) - User login with OAuth support
- **Register** (`/register`) - User registration
- **Verify Email** (`/verify-email`) - Email verification
- **Forgot Password** (`/forgot-password`) - Password reset request
- **Reset Password** (`/reset-password`) - Set new password

### Protected Pages (Require Login)
- **Dashboard** (`/dashboard`) - User dashboard with stats
- **Profile** (`/profile`) - Edit profile and change password
- **Settings** (`/settings`) - 2FA setup and session management

### Admin Pages
- **Admin Login** (`/admin-ysr`) - Admin authentication
- **Admin Dashboard** (`/admin-ysr/dashboard`) - User management and analytics

## Features in Detail

### Authentication
- Email/Password authentication
- OAuth with Google and GitHub
- JWT token-based sessions
- Two-factor authentication (TOTP)
- Email verification
- Password reset
- Remember me functionality

### Dashboard
- Welcome message
- Current plan information
- Subscription status
- Security status (email verification, 2FA)
- Quick actions

### Profile Management
- Update name
- Change password (for non-OAuth accounts)
- View email and plan details
- Profile picture (from OAuth or initials)

### Security Settings
- Setup 2FA with QR code
- Enable/disable 2FA
- View active sessions
- Revoke individual sessions
- Device and IP tracking

### Pricing & Payments
- View all plans
- Free plan (1GB storage)
- Pay as you go (variable pricing)
- Custom enterprise plan
- Razorpay integration for payments
- One-time plan fetch (cached)
- Secure payment verification

### Admin Panel
- Password-protected access
- User statistics
- Revenue analytics
- Plan distribution
- User management
- Recent transactions
- Search functionality

## Responsive Design

The app is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimizations

1. **Code Splitting** - Route-based code splitting
2. **Lazy Loading** - Components loaded on demand
3. **Caching** - Plan data cached in sessionStorage
4. **Optimized Images** - Properly sized images
5. **Minification** - Production build is minified

## Security Features

1. **JWT Storage** - Tokens stored in localStorage
2. **Auto Logout** - On 401 responses
3. **Admin Protection** - Password-based admin access
4. **HTTPS Required** - In production
5. **Input Validation** - Client-side validation

## Styling

### Custom Classes
- `btn` - Base button style
- `btn-primary` - Primary gradient button
- `btn-secondary` - Secondary button
- `btn-danger` - Danger/delete button
- `input` - Input field style
- `card` - Card container
- `card-hover` - Card with hover effect
- `gradient-text` - Gradient text
- `gradient-bg` - Gradient background

### Colors
Primary gradient: Blue to Purple (#667eea → #764ba2)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
