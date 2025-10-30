#!/bin/bash

echo "🚀 Setting up Hypz - Secure Cloud Storage Platform"
echo "=================================================="
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

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL command-line tools not found${NC}"
    echo "Please ensure PostgreSQL is installed and running."
else
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""
echo "📝 Setting up environment files..."

# Backend .env
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping${NC}"
fi

# Frontend .env
cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists, skipping${NC}"
fi

cd ..

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Configure your PostgreSQL database"
echo "2. Edit backend/.env with your credentials:"
echo "   - Database URL"
echo "   - JWT Secret"
echo "   - Email settings"
echo "   - OAuth credentials (Google, GitHub)"
echo "   - Razorpay keys"
echo "   - Admin password"
echo ""
echo "3. Run database migrations:"
echo "   ${YELLOW}cd backend && npm run migrate${NC}"
echo ""
echo "4. Start the development servers:"
echo "   Terminal 1: ${YELLOW}cd backend && npm run dev${NC}"
echo "   Terminal 2: ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "5. Access the application:"
echo "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo "   Backend: ${GREEN}http://localhost:5000${NC}"
echo "   Admin: ${GREEN}http://localhost:3000/admin-ysr${NC}"
echo ""
echo "📚 Read README.md for detailed setup instructions"
echo "=================================================="
