#!/bin/bash

echo "🚀 Hypz Storage - Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"
echo ""

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Make sure it's installed and running.${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created backend/.env from template. Please update with your credentials!${NC}"
fi
npm install
cd ..

echo ""
echo "Installing dashboard dependencies..."
cd dashboard
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠️  Created dashboard/.env.local from template. Please update if needed!${NC}"
fi
npm install
cd ..

echo ""
echo "Installing SDK dependencies..."
cd sdk
npm install
cd ..

echo ""
echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Update configuration files:"
echo "   - backend/.env (DATABASE_URL, B2 credentials, Razorpay keys)"
echo "   - dashboard/.env.local (API URL, Razorpay key)"
echo ""
echo "2. Make sure PostgreSQL is running and create a database:"
echo "   createdb hypz"
echo ""
echo "3. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. In a new terminal, start the dashboard:"
echo "   cd dashboard && npm run dev"
echo ""
echo "5. Visit http://localhost:3000 to access the dashboard"
echo ""
echo -e "${GREEN}🎉 Setup complete! Happy coding!${NC}"
